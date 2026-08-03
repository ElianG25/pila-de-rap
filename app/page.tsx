"use client";

import { useMemo } from "react";
import { getPublicEvents, getPublishedBattles, getVisibleMedia, isSectionEnabled, sortRanking } from "@/lib/domain/league/rules";
import { useLeagueData } from "@/app/hooks/useLeagueData";
import { useSectionRouter } from "@/app/hooks/useSectionRouter";
import { useEventCountdown } from "@/app/hooks/useEventCountdown";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useParallaxScrollY } from "@/app/hooks/useParallaxScrollY";
import { HomeView } from "@/app/components/home/HomeView";
import { LoadingScreen } from "@/app/components/home/LoadingScreen";
import { ErrorScreen } from "@/app/components/home/ErrorScreen";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DESKTOP_QUERY = "(min-width: 768px)";
const BG_VIDEO_ID = "jw-aW3a7pSM";

export default function Home() {
  const { league, loading, error, refreshing } = useLeagueData();

  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const scrollY = useParallaxScrollY(!reducedMotion);

  const { section, visibleSections, activeIndex, direction, navigate, onTouchStart, onTouchEnd } =
    useSectionRouter(league?.config, Boolean(league));

  const timeLeft = useEventCountdown(league?.featuredEvent);

  const ranking = useMemo(() => sortRanking(league?.ranking ?? []), [league?.ranking]);
  const events  = useMemo(() => getPublicEvents(league?.events ?? []), [league?.events]);
  const battles = useMemo(() => getPublishedBattles(league?.battles ?? []), [league?.battles]);
  const media   = useMemo(() => getVisibleMedia(league?.media ?? []), [league?.media]);
  const showRanking = isSectionEnabled(league?.config, "showRanking");

  if (loading) return <LoadingScreen />;
  if (error || !league) return <ErrorScreen message={error} />;

  const bgVideoId = (league.config as Record<string, string>)?.backgroundVideoId ?? BG_VIDEO_ID;

  return (
    <HomeView
      league={league}
      section={section}
      visibleSections={visibleSections}
      activeIndex={activeIndex}
      direction={direction}
      onNavigate={navigate}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      timeLeft={timeLeft}
      ranking={ranking}
      events={events}
      battles={battles}
      media={media}
      showRanking={showRanking}
      reducedMotion={reducedMotion}
      isDesktop={isDesktop}
      scrollY={scrollY}
      refreshing={refreshing}
      bgVideoId={bgVideoId}
    />
  );
}
