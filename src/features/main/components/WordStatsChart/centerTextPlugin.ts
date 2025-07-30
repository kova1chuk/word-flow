import type { Chart as ChartJS, Plugin } from "chart.js/auto";

const centerTextPlugin: Plugin<"doughnut"> = {
  id: "centerText",
  afterDraw(chart: ChartJS) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const datasets = chart.data.datasets;
    // Sum only numbers, ignore nulls/objects and non-numeric types
    const total = datasets[0].data.reduce((acc: number, val) => {
      if (typeof val === "number" && Number.isFinite(val)) {
        return acc + val;
      }
      return acc;
    }, 0);
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    // Badge dimensions (increased for more padding)
    const badgeWidth = 110;
    const badgeHeight = 62;
    const badgeRadius = 22;
    const badgeX = centerX - badgeWidth / 2;
    const badgeY = centerY - badgeHeight / 2;

    ctx.save();
    // Draw rounded rectangle (badge) with transparent background
    ctx.beginPath();
    ctx.moveTo(badgeX + badgeRadius, badgeY);
    ctx.lineTo(badgeX + badgeWidth - badgeRadius, badgeY);
    ctx.quadraticCurveTo(
      badgeX + badgeWidth,
      badgeY,
      badgeX + badgeWidth,
      badgeY + badgeRadius,
    );
    ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - badgeRadius);
    ctx.quadraticCurveTo(
      badgeX + badgeWidth,
      badgeY + badgeHeight,
      badgeX + badgeWidth - badgeRadius,
      badgeY + badgeHeight,
    );
    ctx.lineTo(badgeX + badgeRadius, badgeY + badgeHeight);
    ctx.quadraticCurveTo(
      badgeX,
      badgeY + badgeHeight,
      badgeX,
      badgeY + badgeHeight - badgeRadius,
    );
    ctx.lineTo(badgeX, badgeY + badgeRadius);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeRadius, badgeY);
    ctx.closePath();
    ctx.shadowColor = "#0003";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#d1d5db"; // Tailwind slate-300
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw total number (blue, bold)
    ctx.font = "bold 1.4rem 'Inter', sans-serif";
    ctx.fillStyle = "#2563eb"; // Tailwind blue-600
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((total ?? 0).toString(), centerX, centerY - 8);

    // Draw 'Total Words' label (gray, smaller)
    ctx.font = "0.85rem 'Inter', sans-serif";
    ctx.fillStyle = "#6b7280"; // Tailwind gray-500
    ctx.textBaseline = "top";
    ctx.fillText("Total Words", centerX, centerY + 6);

    ctx.restore();
  },
};

export default centerTextPlugin;
