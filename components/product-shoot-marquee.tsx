import Image from "next/image";

// Real shoot work, so the strip carries its own captions rather than a single
// stock photograph standing in for the service.
const shots = [
  {
    src: "/product1.jpeg",
    alt: "Pair of orange bangles set with gold beads and crystals on a dusky backdrop",
    width: 7008,
    height: 4672,
  },
  {
    src: "/product2.jpeg",
    alt: "Black Fastrack wristwatch styled with matte gift boxes on a white surface",
    width: 6630,
    height: 4420,
  },
  {
    src: "/product3.jpeg",
    alt: "Silver jhumka earrings with green beaded fringe on teal fabric",
    width: 3072,
    height: 4608,
  },
  {
    src: "/product4.jpeg",
    alt: "Yardley Gentleman Royale fragrance bottle resting on wet black gravel",
    width: 7008,
    height: 4672,
  },
  {
    src: "/product5.jpeg",
    alt: "Yardley Gentleman Royale fragrance bottle staged on cotton clouds",
    width: 2016,
    height: 3024,
  },
  {
    src: "/product6.jpeg",
    alt: "Antique gold jhumka earrings with emerald stones on brown fabric",
    width: 3072,
    height: 4608,
  },
  {
    src: "/product7.jpeg",
    alt: "Low-light flat lay of wireless earbuds, a smartwatch, a tablet and a laptop",
    width: 3024,
    height: 2016,
  },
];

// The track holds the set twice and travels exactly half its own width, so the
// second copy lands where the first began and the loop never shows a seam.
// Spacing is a right margin on every tile, not a flex gap: a gap would be left
// out after the final tile and the loop would stutter by that much each pass.
export function ProductShootMarquee() {
  return (
    <div className="product-marquee absolute inset-0">
      <ul className="product-marquee-track flex h-full list-none">
        {[0, 1].map((pass) =>
          shots.map((shot) => (
            <li
              key={`${pass}-${shot.src}`}
              className="mr-2 h-full shrink-0"
              aria-hidden={pass === 1 || undefined}
            >
              <Image
                src={shot.src}
                alt={pass === 0 ? shot.alt : ""}
                width={shot.width}
                height={shot.height}
                sizes="(max-width: 639px) 60vw, 320px"
                className="h-full w-auto max-w-none object-cover"
              />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
