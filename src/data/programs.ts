export interface Program {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  eligibility: string;
  objectives: string[];
  featured?: boolean;
}

export const programs: Program[] = [
  {
    id: "fibre-optics",
    title: "Fibre Optics",
    category: "Technology",
    shortDescription: "Learn the fundamentals of fiber optic technology and telecommunications infrastructure.",
    fullDescription: "Dive into the world of fiber optic technology and telecommunications. This comprehensive program covers the principles of light transmission, fiber optic cable installation, testing, and maintenance. Students will gain hands-on experience with cutting-edge telecommunications infrastructure and prepare for careers in the rapidly growing field of fiber optics.",
    duration: "12 weeks",
    eligibility: "Open to all young women aged 16+",
    objectives: [
      "Understand fiber optic principles and light transmission",
      "Learn fiber optic cable installation and splicing techniques",
      "Master testing and troubleshooting fiber optic systems",
      "Gain certification in fiber optic technology",
      "Build career pathways in telecommunications"
    ],
    featured: true
  },
  {
    id: "physical-mentorship",
    title: "Physical Mentorship Programme",
    category: "Mentorship",
    shortDescription: "One-on-one in-person mentorship with industry professionals in STEM fields.",
    fullDescription: "Connect directly with experienced STEM professionals through our Physical Mentorship Programme. This program offers personalized, in-person guidance tailored to your career goals and interests. Mentees meet regularly with their mentors for hands-on learning, career advice, skill development, and networking opportunities within the STEM community.",
    duration: "6 months",
    eligibility: "Young women pursuing STEM education or careers",
    objectives: [
      "Build meaningful mentor-mentee relationships",
      "Receive personalized career guidance and support",
      "Develop technical and soft skills through hands-on sessions",
      "Access networking opportunities in STEM industries",
      "Create actionable career development plans"
    ],
    featured: true
  },
  {
    id: "virtual-mentorship",
    title: "Virtual Mentorship Programme",
    category: "Mentorship",
    shortDescription: "Flexible online mentorship connecting you with STEM professionals worldwide.",
    fullDescription: "Break geographical barriers with our Virtual Mentorship Programme. Connect with STEM mentors from around the world through video calls, online workshops, and digital collaboration tools. This flexible program allows you to learn from industry experts regardless of location, making mentorship accessible to everyone.",
    duration: "3-6 months (flexible)",
    eligibility: "Open to all young women with internet access",
    objectives: [
      "Access global network of STEM mentors",
      "Participate in virtual workshops and webinars",
      "Develop digital collaboration skills",
      "Receive flexible mentorship that fits your schedule",
      "Build international professional networks"
    ]
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing Programme",
    category: "Business & Technology",
    shortDescription: "Master digital marketing strategies, social media, and online business growth.",
    fullDescription: "Learn how to leverage digital platforms to build brands, reach audiences, and drive business growth. This program covers social media marketing, content creation, SEO, email marketing, analytics, and digital advertising. Perfect for aspiring entrepreneurs and those looking to combine technology with business skills.",
    duration: "10 weeks",
    eligibility: "Open to all young women interested in business and technology",
    objectives: [
      "Master social media marketing and content strategy",
      "Learn SEO and search engine marketing techniques",
      "Understand digital analytics and data-driven decisions",
      "Create effective digital advertising campaigns",
      "Build a portfolio of digital marketing projects"
    ]
  },
  {
    id: "physical-stem-cohort-1",
    title: "Physical STEM Cohort 1",
    category: "Foundation",
    shortDescription: "Intensive hands-on STEM bootcamp covering science, technology, engineering, and math.",
    fullDescription: "Join our flagship Physical STEM Cohort for an immersive, hands-on learning experience. This intensive program brings together a dedicated group of learners for collaborative projects, lab work, and practical STEM applications. Through project-based learning, you'll build foundational skills in science, technology, engineering, and mathematics while working on real-world challenges.",
    duration: "16 weeks",
    eligibility: "Young women aged 14-25 committed to intensive learning",
    objectives: [
      "Build strong STEM foundations through hands-on projects",
      "Collaborate with peers on real-world challenges",
      "Access lab facilities and equipment",
      "Develop problem-solving and critical thinking skills",
      "Prepare for advanced STEM education and careers"
    ]
  }
];

export const getFeaturedPrograms = () => programs.filter(p => p.featured);
export const getProgramById = (id: string) => programs.find(p => p.id === id);
