import Image from "next/image";
// If you had other components such as ThreeD and ThreeDScene, ensure they are also correctly imported.
import ThreeD from "../app/(root)/(routes)/Three/page";
import ThreeDScene from "../app/(root)/(routes)/Three/page_2";
import MoveObject from "../app/(root)/(routes)/Three/page_4"; // Adjust based on actual location
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MoveObject />
    </main>
  );
}
