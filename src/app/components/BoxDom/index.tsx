"use client";

import {
  IconBrandLinkedinFilled,
  IconBrandTelegram,
} from "@tabler/icons-react";
import s from "./BoxDom.module.scss";

export default function BoxDom() {
  return (
    <div
      className={s.head}
      onMouseEnter={() =>
        window.dispatchEvent(
          new CustomEvent("akf-focus-cube", { detail: true })
        )
      }
      onMouseLeave={() =>
        window.dispatchEvent(
          new CustomEvent("akf-focus-cube", { detail: false })
        )
      }
    >
      <p
        onClick={() => window.dispatchEvent(new Event("akf-toggle-holiday"))}
        style={{ cursor: "pointer" }}
      >
        Arthur Koshelenko Felixovich
      </p>
      <a href="mailto:koshelenko.A.dev@proton.me">koshelenko.A.dev@proton.me</a>
      <p className={s.links}>
        <a
          className={s.iconLink}
          href="https://www.linkedin.com/in/arthur-koshelenko-05b671376/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <IconBrandLinkedinFilled />
        </a>
        <a
          className={s.iconLink}
          href="https://t.me/G1lgamesh777"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram"
        >
          <IconBrandTelegram />
        </a>
        <a
          className={s.resumeBtn}
          href="/ArthurKoshelenkoResume.pdf"
          download="ArthurKoshelenkoResume.pdf"
          aria-label="Download Resume"
        >
          Resume
        </a>
      </p>
    </div>
  );
}
