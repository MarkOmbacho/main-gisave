import gheida from "@/assets/Board-members/gheida.jpg";
import mark from "@/assets/Board-members/mark.jpg";
import yusra from "@/assets/Board-members/yusra.jpg";
import asma from "@/assets/Board-members/asma.jpg";
import jumaah from "@/assets/Board-members/jumaah.jpg";
import mulki from "@/assets/Board-members/mulki.jpg";
import abdura from "@/assets/Board-members/abdura.jpg";

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export const boardMembers: BoardMember[] = [
  {
    id: "gheida",
    name: "Gheida Abdala",
    role: "Founder",
    image: gheida,
  },
  {
    id: "mark",
    name: "Mark Ombacho",
    role: "Co-founder",
    image: mark,
  },
  {
    id: "yusra",
    name: "Yusra",
    role: "Program Associate",
    image: yusra,
  },
  {
    id: "asma",
    name: "Asma Bashir",
    role: "Human Resource",
    image: asma,
  },
  {
    id: "jumaah",
    name: "Jumaah Abdala",
    role: "Corporate Secretary",
    image: jumaah,
  },
  {
    id: "mulki",
    name: "Mulki Mohammed",
    role: "Head of Communications",
    image: mulki,
  },
  {
    id: "abdura",
    name: "Abdulrahman",
    role: "Head of Media",
    image: abdura,
  },
];

export const getBoardMembers = (): BoardMember[] => {
  return boardMembers;
};
