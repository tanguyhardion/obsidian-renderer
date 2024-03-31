import styles from "./page.module.sass";
import { Navbar } from "./components/navbar.component";

export default async function Home() {
  return (
    <main className={styles.main}>
      <Navbar> </Navbar>
    </main>
  );
}
