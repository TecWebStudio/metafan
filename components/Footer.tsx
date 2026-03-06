import Link from "next/link";

const navigation = {
  company: [
    { label: "Chi Siamo", href: "/about" },
    { label: "Tecnologie", href: "/technology" },
    { label: "Carriere", href: "#" },
    { label: "News", href: "#" },
  ],
  services: [
    { label: "Progettazione PCB", href: "/services" },
    { label: "Soluzioni IoT", href: "/services" },
    { label: "AR/VR Systems", href: "/services" },
    { label: "Stampa 3D", href: "/services" },
    { label: "Firmware", href: "/services" },
  ],
  contact: [
    { label: "Contattaci", href: "/contact" },
    { label: "Supporto", href: "/contact" },
    { label: "Area Gestione", href: "/login" },
    { label: "Documentazione", href: "#" },
  ],
};

const socials = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      style={{ background: "#060910", borderTop: "1px solid rgba(201,164,76,.12)" }}
      className="mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-[#060910] text-sm"
                style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
              >
                MF
              </div>
              <span className="text-xl font-bold text-white">
                Meta<span style={{ color: "#c9a44c" }}>Fan</span>
              </span>
            </div>
            <p className="text-sm text-[#8899b4] leading-relaxed mb-6">
              Innovazione elettronica di precisione. PCB, IoT, AR/VR e soluzioni avanzate per la manifattura moderna.
            </p>
            <div className="flex gap-3">
              {socials.map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: "rgba(201,164,76,.08)",
                    border: "1px solid rgba(201,164,76,.2)",
                    color: "#8899b4",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {icon}
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Azienda", items: navigation.company },
            { title: "Servizi", items: navigation.services },
            { title: "Supporto", items: navigation.contact },
          ].map(({ title, items }) => (
            <div key={title}>
              <h4
                className="text-sm font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#c9a44c" }}
              >
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#8899b4] hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(201,164,76,.08)" }}
        >
          <p className="text-xs text-[#8899b4]">
            © {new Date().getFullYear()} MetaFan S.r.l. Tutti i diritti riservati.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Termini di Servizio", "Cookie"].map((t) => (
              <Link
                key={t}
                href="#"
                className="text-xs text-[#8899b4] hover:text-white transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
