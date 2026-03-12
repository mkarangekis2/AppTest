import { MODULE_CATALOG } from "@/config/modules";
import { PACKAGE_CATALOG } from "@/config/packages";
import { INDUSTRY_PACK_CATALOG } from "@/config/industry-packs";
import { BASE_RECOMMENDATION_RULES } from "@/config/recommendation-rules/base";
import { OnboardingPayload, RecommendationItem } from "@/lib/acg/types";

export function generateRecommendations(input: OnboardingPayload): RecommendationItem[] {
  const seen = new Set<string>();
  const items: RecommendationItem[] = [];

  for (const rule of BASE_RECOMMENDATION_RULES) {
    if (!rule.when(input)) {
      continue;
    }

    for (const slug of rule.recommendModuleSlugs || []) {
      const moduleDef = MODULE_CATALOG.find((item) => item.slug === slug);
      if (!moduleDef) continue;
      const key = `module:${moduleDef.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);

      items.push({
        recommendationType: "module",
        slug: moduleDef.slug,
        title: moduleDef.name,
        problemSolved: moduleDef.problemSolved,
        reason: rule.reason(input),
        expectedImpact: rule.impact,
        implementationComplexity: moduleDef.complexity,
        setupEstimate: moduleDef.setupEstimate,
        requiredIntegrations: moduleDef.requiredIntegrations,
        evidence: {
          ruleId: rule.id,
          leadVolume: input.leadVolume,
          supportVolume: input.supportVolume,
          painPoints: input.painPoints
        }
      });
    }

    for (const slug of rule.recommendPackageSlugs || []) {
      const pkg = PACKAGE_CATALOG.find((item) => item.slug === slug);
      if (!pkg) continue;
      const key = `package:${pkg.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);

      items.push({
        recommendationType: "package",
        slug: pkg.slug,
        title: pkg.name,
        problemSolved: pkg.description,
        reason: rule.reason(input),
        expectedImpact: rule.impact,
        implementationComplexity: "medium",
        setupEstimate: pkg.setupEstimate,
        requiredIntegrations: [],
        evidence: {
          ruleId: rule.id,
          includedModules: pkg.includedModuleSlugs
        }
      });
    }

    for (const slug of rule.recommendIndustryPackSlugs || []) {
      const pack = INDUSTRY_PACK_CATALOG.find((item) => item.slug === slug);
      if (!pack) continue;
      const key = `industry_pack:${pack.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const requiredIntegrations = Array.from(
        new Set(
          pack.includedModuleSlugs
            .map((moduleSlug) => MODULE_CATALOG.find((item) => item.slug === moduleSlug))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .flatMap((item) => item.requiredIntegrations)
        )
      );

      items.push({
        recommendationType: "industry_pack",
        slug: pack.slug,
        title: pack.name,
        problemSolved: pack.description,
        reason: rule.reason(input),
        expectedImpact: rule.impact,
        implementationComplexity: "medium",
        setupEstimate: "3-6 days",
        requiredIntegrations,
        evidence: {
          ruleId: rule.id,
          industries: pack.industries,
          includedModules: pack.includedModuleSlugs,
          kpiPresets: pack.kpiPresets
        }
      });
    }
  }

  return items;
}
