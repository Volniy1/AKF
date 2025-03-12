import BoxDom from "./components/BoxDom";
import ThreeScene from "./components/Scene/Scene";

export default function Home() {
  return (
    <main style={{ display: "flex", justifyContent: "center" }}>
      <BoxDom />
      <ThreeScene />
    </main>
  );
}
