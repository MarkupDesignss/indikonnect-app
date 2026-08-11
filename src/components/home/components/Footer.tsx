import { Logo, Wrap } from "../design-system";
import { footerColumns } from "../../../data/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.foot}>
      <Wrap>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo className={styles.logo} title="IndieKonnect" />
            <p>
              Connecting India through opportunity and excellence. One nation, one network, endless
              possibilities.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className={styles.col}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bot}>
          <span>&copy; 2026 IndieKonnect. All rights reserved.</span>
          <span>One Nation. One Network. Endless Possibilities.</span>
        </div>
      </Wrap>
    </footer>
  );
}
