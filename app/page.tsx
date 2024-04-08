
import Image from "next/image";
// import ThreeD from "./About/page";
import ThreeD from "./Three/page";
import ThreeDScene from "./Three/page_3"




export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ThreeDScene/>
    </main>
  );
}
