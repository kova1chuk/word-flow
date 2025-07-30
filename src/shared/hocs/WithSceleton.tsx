import { ReactNode } from "react";

interface WithSkeletonProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton: ReactNode;
}

const WithSkeleton = ({ isLoading, children, skeleton }: WithSkeletonProps) =>
  isLoading ? skeleton : children;

export default WithSkeleton;
