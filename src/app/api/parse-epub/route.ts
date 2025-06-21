import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import EPub from "epub";
import { promisify } from "util";
import { existsSync } from "fs";

// Configure the API route
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    responseLimit: "50mb",
  },
};

async function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function cleanupFile(filePath: string) {
  try {
    await rm(filePath, { force: true });
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
}

async function extractTextFromEPUB(
  filePath: string
): Promise<{ text: string; epub: EPub }> {
  return new Promise((resolve, reject) => {
    try {
      const epub = new EPub(filePath);
      let extractedText = "";

      epub.on("end", async () => {
        try {
          // Get the flow (chapters) of the book
          const chapters = epub.flow;

          if (!chapters || chapters.length === 0) {
            reject(new Error("No chapters found in EPUB"));
            return;
          }

          console.log("Found chapters:", chapters.length);

          // Process each chapter
          for (const chapter of chapters) {
            const getChapterRaw = promisify(epub.getChapterRaw.bind(epub));
            try {
              console.log("Processing chapter:", chapter.id);
              const rawContent = await getChapterRaw(chapter.id);

              if (typeof rawContent !== "string") {
                console.warn(
                  `Chapter ${chapter.id} content is not a string:`,
                  rawContent
                );
                continue;
              }

              // Basic text cleanup for raw content
              const cleanText = rawContent
                .replace(/\r\n|\r|\n/g, " ") // Replace line breaks with spaces
                .replace(/\s+/g, " ") // Replace multiple spaces with single space
                .trim();

              if (cleanText) {
                extractedText += " " + cleanText;
                console.log(
                  `Added ${cleanText.length} characters from chapter ${chapter.id}`
                );
              }
            } catch (err) {
              console.error(`Error processing chapter ${chapter.id}:`, err);
            }
          }

          if (!extractedText.trim()) {
            reject(new Error("No text content extracted from EPUB"));
            return;
          }

          console.log("Total extracted text length:", extractedText.length);
          resolve({ text: extractedText.trim(), epub });
        } catch (error) {
          console.error('Error in epub.on("end"):', error);
          reject(error);
        }
      });

      epub.on("error", (err) => {
        console.error("EPUB parsing error:", err);
        reject(err);
      });

      epub.parse();
    } catch (error) {
      console.error("Error creating EPub instance:", error);
      reject(error);
    }
  });
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".epub")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an EPUB file." },
        { status: 400 }
      );
    }

    // Create a temporary file path
    const tempDir = join(process.cwd(), "tmp");
    tempFilePath = join(tempDir, `temp-${Date.now()}.epub`);

    // Ensure temp directory exists
    await ensureDirectoryExists(tempDir);

    // Write the uploaded file to disk temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);

    console.log("Processing EPUB file:", file.name);

    // Extract text from EPUB
    const { text: extractedText, epub } = await extractTextFromEPUB(
      tempFilePath
    );

    // Clean up the temporary file
    await cleanupFile(tempFilePath);

    // Get metadata
    const metadata = {
      title: epub.metadata.title || "Unknown Title",
      creator: epub.metadata.creator || "Unknown Author",
      language: epub.metadata.language || "Unknown",
      subject: epub.metadata.subject || "",
      description: epub.metadata.description || "",
    };

    console.log("Successfully processed EPUB:", metadata.title);

    return NextResponse.json({
      text: extractedText,
      metadata,
    });
  } catch (error) {
    // Log the full error for debugging
    console.error("Detailed error processing EPUB:", error);

    // Clean up on error if the temp file exists
    if (tempFilePath) {
      await cleanupFile(tempFilePath);
    }

    // Return a more specific error message if available
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process EPUB file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
