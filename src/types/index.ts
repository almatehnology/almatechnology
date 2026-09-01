export type Service = {
  key: string;
  icon: string;
};

export type Advantage = {
  key: string;
  icon: string;
};

export type PortfolioProject = {
  id: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  image?: string;
  tags: string[];
  url?: string;
};

export type ProcessStep = {
  key: string;
  number: string;
  icon: string;
};

export type Testimonial = {
  id: string;
  nameRu: string;
  nameEn: string;
  companyRu: string;
  companyEn: string;
  quoteRu: string;
  quoteEn: string;
  avatar?: string;
};
