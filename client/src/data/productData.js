import blueberryImage from "../assets/blueberry.jpeg";
import lemonImage from "../assets/lemon.jpeg";
import pinkImage from "../assets/pink.jpeg";
import greenAppleImage from "../assets/green-apple.jpeg";
import purpleImage from "../assets/purple.png";
import strawberryImage from "../assets/strawberry.jpeg";

export const shades = [
  {
    id: "strawberry",
    name: "Strawberry",
    color: "#D52B32",
    image: strawberryImage,
  },
  {
    id: "lemon",
    name: "Lemon",
    color: "#E5B719",
    image: lemonImage,
  },
  {
    id: "blueberry",
    name: "Blue Berry",
    color: "#159DB8",
    image: blueberryImage,
  },
  {
    id: "rose-blush",
    name: "Rose Blush",
    color: "#E63E82",
    image: pinkImage,
  },
  {
    id: "green-apple",
    name: "Green Apple",
    color: "#83C52A",
    image: greenAppleImage,
  },
  {
    id: "purple",
    name: "Purple",
    color: "#9A63B7",
    image: purpleImage,
  },
];

export const product = {
  id: "ceresea",
  name: "Ceresea",

  price: 120,

  netQuantity: "2.5 gm",

  ingredients: [
    "Beeswax / Honey",
    "Shea Butter",
    "Coconut Oil",
    "Vitamin E"
  ],

  shades,
};