/**
 * CLABE interbancaria: 18 dígitos = banco (3) + plaza (3) + cuenta (11) +
 * dígito de control (1). El control se calcula con pesos 3, 7, 1 módulo 10.
 */
import { BANCOS } from "./bancos-clabe";

const PESOS = [3, 7, 1];

/** Dígito de control para los primeros 17 dígitos. */
export const digitoControl = (base17: string): number => {
  const suma = [...base17].reduce((acc, d, i) => acc + ((Number(d) * PESOS[i % 3]) % 10), 0);
  return (10 - (suma % 10)) % 10;
};

export interface AnalisisClabe {
  digitos: string;
  banco: string | null;
  codigoBanco: string;
  plaza: string;
  cuenta: string;
  control: string;
  controlEsperado: number;
  /** false cuando solo se escribieron 17 dígitos y se calculó el control. */
  completa: boolean;
  valida: boolean;
}

/** Quita espacios, guiones y puntos. */
export const limpiarClabe = (input: string) => input.replace(/[\s\-.]/g, "");

export const analizarClabe = (input: string): AnalisisClabe => {
  const digitos = limpiarClabe(input);
  if (!/^\d*$/.test(digitos)) throw new Error("La CLABE solo lleva dígitos.");
  if (digitos.length !== 17 && digitos.length !== 18) {
    throw new Error(`La CLABE tiene 18 dígitos y escribiste ${digitos.length}.`);
  }
  const codigoBanco = digitos.slice(0, 3);
  const controlEsperado = digitoControl(digitos.slice(0, 17));
  const completa = digitos.length === 18;
  const control = completa ? digitos[17] : String(controlEsperado);
  const banco = BANCOS[codigoBanco] ?? null;
  return {
    digitos: completa ? digitos : digitos + controlEsperado,
    banco,
    codigoBanco,
    plaza: digitos.slice(3, 6),
    cuenta: digitos.slice(6, 17),
    control,
    controlEsperado,
    completa,
    valida: Number(control) === controlEsperado && banco !== null,
  };
};

/** "002 180 70123456789 1" para leerla en voz alta o dictarla. */
export const formatearClabe = (digitos: string) =>
  [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 17), digitos.slice(17)].filter(Boolean).join(" ");
