// Una carta de la baraja de feria, como la dibuja la app (gemela de Cara.astro). La carta en turno va
// grande y sin placa: su nombre se escribe fuera, en grande.
import { cartas, imagen, textoAlt } from "@/data/frijolito-cartas";

type Props = {
  n: number;
  placa?: boolean;
  grande?: boolean;
  /** Sin texto alternativo: la carta ya se nombra al lado. */
  decorativa?: boolean;
  lazy?: boolean;
  /** Ancho en pantalla (atributo sizes): con él trae también la copia de 208 px (cartas/chica/), como Cara.astro. */
  sizes?: string;
};

export default function Cara({ n, placa = true, grande = false, decorativa = false, lazy = false, sizes }: Props) {
  const carta = cartas[n - 1];
  const src = imagen(carta, grande);
  const chica = !grande && sizes ? src.replace("/cartas/", "/cartas/chica/") : undefined;
  return (
    <div className="fj-cara">
      <div className="fj-cara__dibujo">
        <img
          src={src}
          srcSet={chica && `${chica} 208w, ${src} 300w`}
          sizes={chica && sizes}
          alt={decorativa ? "" : textoAlt(carta)}
          width={grande ? 480 : 300}
          height={grande ? 720 : 450}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          draggable={false}
        />
        <span className="fj-cara__numero" aria-hidden="true">
          {carta.n}
        </span>
      </div>
      {placa && (
        <span className="fj-cara__placa" aria-hidden="true">
          {carta.nombre}
        </span>
      )}
    </div>
  );
}
