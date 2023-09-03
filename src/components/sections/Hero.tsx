import { api } from "@/utils/api";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Text } from "@mantine/core";
import Link from "next/link";
import React, { useState } from "react";
import Container from "@/components/custom-components/container";
import { useMantineColorScheme } from "@mantine/core";
import CustomButton from "@/components/custom-components/button";
import StickyBanner from "@/components/custom-components/newsBanner";

export default function Hero() {
  const { user } = useUser();
  const [showBanner, setShowBanner] = useState(true);

  const announcements = api.announcements.getAnnouncements.useQuery();
  const announcement = announcements.data?.[0];

  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Container>
      <section className="z-0 flex h-[90vh] w-full flex-col items-center justify-center gap-y-7 bg-cover bg-center bg-no-repeat">
        {showBanner && announcement && <StickyBanner announcement={announcement} onClose={() => setShowBanner(false)} />}
        <Text className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl/[90px]" variant="gradient" gradient={{ from: "indigo", to: "cyan", deg: 95 }}>
          Discover the most vibrant and engaged tech communities.
        </Text>

        <Text className={`mx-auto max-w-full text-center text-base sm:text-2xl lg:max-w-screen-md ${dark ? "text-slate-400" : "text-slate-600"}`}>
          Welcome to Teksade. An easier and faster tech community discovery platform. Find your place among like-minded individuals.
        </Text>
        <div
          className=" grid gap-3 text-center sm:grid-cols-2
        "
        >
          {user ? (
            <Link href="#popular">
              <CustomButton size="lg" variant="gradient" title="Get Started" />
            </Link>
          ) : (
            <Link href="/sign-up">
              <CustomButton size="lg" variant="gradient" title="Join Us" />
            </Link>
          )}
          <Link href="/about">
            <CustomButton size="lg" variant="outline" title="Learn More" />
          </Link>
        </div>
      </section>
    </Container>
  );
}
