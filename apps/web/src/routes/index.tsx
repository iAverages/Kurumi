import { Title } from "solid-start";
import Counter from "~/components/Counter";
import { Card } from "ui"

export default function Home() {
  return (
    <main>
      <Card  href={""} title={"aweomse"}/>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <Counter />
      <p class={"bg-red-400"}>
        Visit{" "}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
