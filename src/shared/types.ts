import { z } from "zod";

// ---------------------------------------------------------------------------
// Site metadata
// ---------------------------------------------------------------------------

export const SiteConfigSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  logo: z.string(),
  favicon: z.string(),
  url: z.string().url(),
  repo: z.string().url(),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export const ThemeDarkColorsSchema = z.object({
  background: z.string(),
  surface: z.string(),
  text: z.string(),
});

export type ThemeDarkColors = z.infer<typeof ThemeDarkColorsSchema>;

export const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.string(),
  dark: ThemeDarkColorsSchema.optional(),
});

export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const ThemeFontsSchema = z.object({
  heading: z.string(),
  body: z.string(),
  code: z.string(),
});

export type ThemeFonts = z.infer<typeof ThemeFontsSchema>;

export const ThemeRadiusSchema = z.enum(["none", "sm", "md", "lg", "full"]);

export type ThemeRadius = z.infer<typeof ThemeRadiusSchema>;

export const ThemeSchema = z.object({
  colors: ThemeColorsSchema,
  fonts: ThemeFontsSchema,
  radius: ThemeRadiusSchema,
});

export type Theme = z.infer<typeof ThemeSchema>;

// ---------------------------------------------------------------------------
// Landing page sections
// ---------------------------------------------------------------------------

const CTAButtonSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const HeroSectionSchema = z.object({
  type: z.literal("hero"),
  title: z.string(),
  subtitle: z.string().optional(),
  primaryCTA: CTAButtonSchema.optional(),
  secondaryCTA: CTAButtonSchema.optional(),
  image: z.string().optional(),
});

export type HeroSection = z.infer<typeof HeroSectionSchema>;

export const FeatureItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export type FeatureItem = z.infer<typeof FeatureItemSchema>;

export const FeaturesSectionSchema = z.object({
  type: z.literal("features"),
  title: z.string().optional(),
  columns: z.number().int().min(1).max(4).optional(),
  items: z.array(FeatureItemSchema),
});

export type FeaturesSection = z.infer<typeof FeaturesSectionSchema>;

export const CTASectionSchema = z.object({
  type: z.literal("cta"),
  title: z.string(),
  description: z.string().optional(),
  button: CTAButtonSchema,
});

export type CTASection = z.infer<typeof CTASectionSchema>;

export const TestimonialItemSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
});

export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;

export const TestimonialsSectionSchema = z.object({
  type: z.literal("testimonials"),
  items: z.array(TestimonialItemSchema),
});

export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>;

export const LandingSectionSchema = z.discriminatedUnion("type", [
  HeroSectionSchema,
  FeaturesSectionSchema,
  CTASectionSchema,
  TestimonialsSectionSchema,
]);

export type LandingSection = z.infer<typeof LandingSectionSchema>;

export const LandingSchema = z.object({
  sections: z.array(LandingSectionSchema),
});

export type Landing = z.infer<typeof LandingSchema>;

// ---------------------------------------------------------------------------
// Docs configuration
// ---------------------------------------------------------------------------

export const DocsVersionSchema = z.object({
  label: z.string(),
  path: z.string(),
});

export type DocsVersion = z.infer<typeof DocsVersionSchema>;

export const DocsSearchSchema = z.object({
  enabled: z.boolean(),
  placeholder: z.string().optional(),
});

export type DocsSearch = z.infer<typeof DocsSearchSchema>;

export const DocsSidebarSchema = z.object({
  collapsible: z.boolean().optional(),
});

export type DocsSidebar = z.infer<typeof DocsSidebarSchema>;

export const DocsTocSchema = z.object({
  minHeading: z.number().int().min(1).max(6),
  maxHeading: z.number().int().min(1).max(6),
});

export type DocsToc = z.infer<typeof DocsTocSchema>;

export const DocsConfigSchema = z.object({
  defaultVersion: z.string(),
  versions: z.array(DocsVersionSchema),
  search: DocsSearchSchema,
  sidebar: DocsSidebarSchema.optional(),
  toc: DocsTocSchema.optional(),
});

export type DocsConfig = z.infer<typeof DocsConfigSchema>;

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const NavLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  external: z.boolean().optional(),
});

export type NavLink = z.infer<typeof NavLinkSchema>;

export const NavSchema = z.object({
  links: z.array(NavLinkSchema),
});

export type Nav = z.infer<typeof NavSchema>;

// ---------------------------------------------------------------------------
// Full configuration
// ---------------------------------------------------------------------------

export const FullConfigSchema = z.object({
  site: SiteConfigSchema,
  theme: ThemeSchema,
  landing: LandingSchema,
  docs: DocsConfigSchema,
  nav: NavSchema,
});

export type FullConfig = z.infer<typeof FullConfigSchema>;
