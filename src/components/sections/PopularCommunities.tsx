/* eslint-disable @next/next/no-img-element */
import { techFocusAreas } from "@/utils/constants";
import { Button, Chip, LoadingOverlay, Paper, rem } from "@mantine/core";
import React, { useState } from "react";
import { Carousel } from "@mantine/carousel";
import Link from "next/link";
import { api } from "@/utils/api";
import { useDownloadURL } from "react-firebase-hooks/storage";
import { ref } from "firebase/storage";
import { storageBucket } from "@/utils/firestoreConfig";

export default function PopularCommunities() {
  const popularCommunities = api.communities.getPopularCommunities.useQuery();
  const [selectedTechnlogies, setselectedTechnlogies] = useState(["JavaScript", "React", "Django", "Laravel"]);

  return (
    <div id="popular" className=" container mx-auto min-h-[80vh] pt-20 ">
      <p className="flex justify-between w-full text-lg font-bold ">
        <span className="">Popular Communities</span>{" "}
        <Link href="communities">
          <Button className="rounded-full ">Show All</Button>
        </Link>
      </p>
      <div className="flex gap-2 my-3 overflow-x-scroll ">
        <Chip.Group multiple value={selectedTechnlogies} onChange={setselectedTechnlogies}>
          <Chip value="All" variant="filled">
            ALL
          </Chip>
          {["All", ...techFocusAreas].map((tech) => (
            <Chip key={tech} value={tech} variant="filled">
              {tech}
            </Chip>
          ))}
        </Chip.Group>
      </div>
      <div className="p-3 overflow-x-auto shadow-xl">
        <Carousel slideGap="md" loop align="start" slidesToScroll={1} controlsOffset="3%" slideSize="33.33%" breakpoints={[{ maxWidth: "sm", slideSize: "100%", slideGap: rem(2) }]} className="my-5 ">
          {popularCommunities.data?.map((community) => (
            <Carousel.Slide key={community.id} className="rounded shadow-xl  w-60">
              <Link href={`/communities/${community.id}`}>
                <Paper withBorder className="h-full ">
                  <div className="">
                    <CommunityImage communityName={community.name.split(" ").join("")} />
                  </div>
                  <div className="p-2 ">
                    <h3 className="flex items-center justify-between ">{community.name}</h3>
                    <p className="flex items-center overflow-x-scroll ">
                      {community.technologies.map((tech) => (
                        <p className="" key={tech}>
                          #{tech}
                        </p>
                      ))}
                    </p>
                  </div>
                </Paper>
              </Link>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

function CommunityImage({ communityName }: { communityName: string }) {
  const [value, loading] = useDownloadURL(ref(storageBucket, communityName));

  return (
    <div className="">
      <LoadingOverlay visible={loading} />
      <img src={value ? value : "/img/g-1.jpg"} alt="community log" className="object-cover w-full h-60" />
    </div>
  );
}
