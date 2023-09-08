/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @next/next/no-img-element */
import { api } from "@/utils/api";
import { Avatar, LoadingOverlay, Text } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import { useDownloadURL } from "react-firebase-hooks/storage";
import { ref } from "firebase/storage";
import { storageBucket } from "@/utils/firestoreConfig";
import MemberCard from "@/components/sections/MemberCard";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FaTwitter, FaGithub, FaYoutube, FaMapPin, FaLinkedin, FaWhatsapp, FaGlobe, FaPhone, FaUserFriends, FaMapMarkedAlt } from "react-icons/fa";
import { Group, ActionIcon, Tooltip, Chip } from "@mantine/core";
import Image from "next/image";
import { useMantineColorScheme } from "@mantine/core";
import Checkmark from "@/components/custom-components/icons/checkmark";
import Container from "@/components/custom-components/container";
import CustomButton from "@/components/custom-components/button";
import { CommunitySEO } from "@/components/SEO";
import LikeButton from "@/components/custom-components/likeButton";
import CommunitySkeleton from "@/components/custom-components/skeletons/Community/Community";
import ImageSkeleton from "@/components/custom-components/skeletons/Community/FeaturedImage";
import LocationIcon from "@/components/custom-components/icons/locationIcon";
import CategoryIcon from "../custom-components/icons/categoryIcon";
import confetti from "canvas-confetti";
import useMantineNotify from "@/hooks/useNotify";


interface SocialLinksProps {
  links: {
    twitter: string;
    github: string;
    linkedin: string;
    website: string;
    whatsapp: string;
    phone: string;
    [key: string]: string | undefined;
  };
}

interface TechnologiesProps {
  technologies: string[];
  dark: boolean;
}

const SocialLinks = ({ links }: SocialLinksProps) => {
  const icons = {
    twitter: FaTwitter,
    github: FaGithub,
    linkedin: FaLinkedin,
    website: FaGlobe,
    whatsapp: FaWhatsapp,
    phone: FaPhone,
  };

  return (
    <Group spacing="xs" className="my-6">
      {Object.entries(icons).map(([key, Icon]) => {
        const url = links[key];
        if (url && url.trim() !== "") {  // Check if the URL exists and is not just whitespace
          return (
            <Link key={key} href={url} passHref>
              <ActionIcon size="lg" variant="default" radius="xl">
                <Icon />
              </ActionIcon>
            </Link>
          );
        }
        return null;  // Explicitly return null if the link does not exist or is invalid
      })}
    </Group>
  );
};

const Technologies = ({ technologies, dark }: TechnologiesProps) => {
  const textColor = dark ? "text-[#00afef]" : "text-[#1A56DB]";
  return (
    <div className="mt-7 flex flex-wrap items-center">
      {technologies.map((tech) => (
        <Chip key={tech} value={tech} className="mb-2 mr-2">
          <p className={textColor}>{tech}</p>
        </Chip>
      ))}
    </div>
  );
};

export default function SingleCommunityPage() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const communityId = useRouter().query.id;
  const { user } = useUser();
  const queryClient = api.useContext();
  const { notifyError, notifySuccess } = useMantineNotify();
  const memberInfo = api.members.getMemberInfo.useQuery({ memberId: user?.id ?? "" });
  const communityInfo = api.communities.getCommunityInfo.useQuery({ communityId: communityId as string });
  const addLikeToCommunity = api.likes.addLikeToCommunity.useMutation();
  const removeExistingLike = api.likes.removeExistingLike.useMutation();
  const getCommunityLikeCount = api.likes.getCommunintyLikes.useQuery({ communityId: communityId as string });
  const addMemberToCommunity = api.communities.addMemberToCommunity.useMutation();
  const removeMemberFromCommunity = api.communities.removeMemberFromCommunity.useMutation({
    onSuccess: () => {
      void queryClient.communities.getCommunityInfo.refetch({ communityId: communityId as string });
      notifySuccess({
        title: "Exit complete",
        message: "You have left this community",
      });
    },
  });
  const [logoImage, loading] = useDownloadURL(ref(storageBucket, `logos/${communityInfo.data?.logo_link}`));

  // Check if current member is already a member of the community
  const isMember = communityInfo.data?.members.some((member) => member.id === memberInfo.data?.id);

  const linksData = {
    twitter: communityInfo.data?.twitter ?? "",
    github: communityInfo.data?.github ?? "",
    linkedin: communityInfo.data?.linkedin ?? "",
    website: communityInfo.data?.website ?? "",
    whatsapp: communityInfo.data?.whatsapp ?? "",
    phone: communityInfo.data?.phone ?? "",
  };

  const likeCommunity = (communityId: string, memberId: string) => {
    if (getCommunityLikeCount.data?.likes.find((like) => like.memberId === memberId)) {
      const exsitingLike = getCommunityLikeCount.data.likes.find((like) => like.memberId === memberId);
      void removeExistingLike.mutateAsync({ likeId: exsitingLike?.id ?? 0 }).then((returnValue) => {
        if (returnValue?.id) {
          void queryClient.likes.getCommunintyLikes.refetch({ communityId: communityId });
        }
      });
    } else {
      void addLikeToCommunity
        .mutateAsync({
          communityId: communityId,
          memberId: memberId,
        })
        .then((returnValue) => {
          if (returnValue) {
            void confetti({
              particleCount: 400,
              scalar: 0.6,
              ticks: 400,
              spread: 180,
              origin: {
                y: 0,
                x: 0.5,
              },
            });
            void queryClient.likes.getCommunintyLikes.refetch({ communityId: communityId });
          }
        });
    }
  };

  const addMember2Community = (communityId: string, memberId: string) => {
    void addMemberToCommunity
      .mutateAsync({
        communityId: communityId,
        memberId: memberId,
      })
      .then((returnValue) => {
        if (returnValue?._count.members) {
          notifySuccess({
            title: "Welcome onboard",
            message: "You are now a member",
          });
          void queryClient.communities.getCommunityInfo.refetch();
        } else {
          notifyError({
            title: "Error!",
            message: "Hmm, that wasn't supposed to happen.",
          });
        }
      });
  };
  const removeExistingMember = (communityId: string, memberId: string) => {
    removeMemberFromCommunity.mutate({
      communityID: communityId,
      memberID: memberId,
    });
  };

  return (
    <>
      <CommunitySEO
        name={communityInfo.data?.name ?? " "}
        description={communityInfo.data?.description ?? " "}
        logoLink={communityInfo.data?.logo_link ?? " "}
        website={communityInfo.data?.website ?? " "}
        technologies={communityInfo.data?.technologies ?? []}
        country={communityInfo.data?.country ?? " "}
        location={communityInfo.data?.location ?? " "}
        focusArea={communityInfo.data?.focus_area ?? " "}
      />
      <Container>
        {communityInfo.isLoading ? (
          <CommunitySkeleton />
        ) : (
          <div className="py-10">
            {/* Top info: Community name, focus area, and location */}
            <div className="mb-6 flex flex-col space-y-5">
              <h1 className="flex items-center text-2xl font-semibold md:text-4xl">{communityInfo.data?.name}</h1>

              <div className="flex items-center space-x-1">
                <CategoryIcon />
                <h2 className={`text-lg font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>{communityInfo.data?.focus_area}</h2>
              </div>
              <span className={`font-normal ${dark ? "text-slate-400" : "text-slate-600"}`}>
                <dd className={`flex items-center space-x-1.5 ${dark ? "text-[#00afef]" : "text-[#1A56DB]"}`}>
                  <LocationIcon />
                  <h3 className={`text-base font-normal ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    {communityInfo.data?.location}, {communityInfo.data?.country}
                  </h3>
                </dd>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-20">
              {/* Image */}
              <div className="h-full w-full overflow-hidden rounded-lg shadow-lg">
                <Image src={logoImage ?? "/img/hero.jpg"} alt="featured-image" className="h-full w-full object-cover object-center" width={900} height={500} loading="lazy" />
              </div>

              {/* Description */}
              <div className="order-2 space-y-10 lg:order-3">
                <div className="flex justify-between pt-5">
                  {/* CTA button */}
                  <div>
                    <LoadingOverlay visible={addMemberToCommunity.isLoading} />
                    {!isMember ? (
                      <CustomButton
                        size="md"
                        color="indigo"
                        title={"Join Community"}
                        onClickHandler={() => {
                          memberInfo.data?.id && addMember2Community(communityId as string, memberInfo.data.id);
                        }}
                        loadingText="Joining..."
                        isLoading={addMemberToCommunity.isLoading}
                      />
                    ) : memberInfo.data?.id === communityInfo.data?.creatorId ? (
                      <Link href="/communities/created">
                        <CustomButton size="md" color="indigo" title={"Update Commununity"} />
                      </Link>
                    ) : (
                      <CustomButton
                        onClickHandler={() => {
                          removeExistingMember(communityInfo.data?.id ?? "", user?.id ?? "");
                        }}
                        size="md"
                        color="indigo"
                        title={"Leave Community"}
                      />
                    )}
                  </div>
                  {/* Like button */}
                  <div>
                    {communityId && memberInfo.data?.name && (
                      <span className="flex items-center space-x-3">
                        <LikeButton
                          onClickHandler={() => {
                            memberInfo.data?.id && likeCommunity(communityId as string, memberInfo.data?.id);
                          }}
                          likes={getCommunityLikeCount.data?._count.likes ?? 0}
                          disabled={addLikeToCommunity.isLoading || removeExistingLike.isLoading || getCommunityLikeCount.isLoading}
                        />
                      </span>
                    )}
                  </div>
                </div>
                <p className={`${dark ? "text-gray-300" : "text-gray-700"}`}>{communityInfo.data?.description}</p>
              </div>

              {/* Right side content on larger screens, below image on smaller screens */}
              <div className="order-3 space-y-5 lg:order-2">
                {/* Social Media Links */}
                <div className="flex items-center  lg:items-end">
                  <SocialLinks links={linksData} />
                </div>
                <Technologies technologies={communityInfo.data?.technologies ?? []} dark={dark} />
                {/* Contributor info */}
                <MemberCard memberId={communityInfo.data?.creatorId ?? ""} isCreator />
                <p className={dark ? "text-slate-400" : "text-slate-600"}>Members</p>
                {/* Members */}
                <div className="flex">
                  <Tooltip.Group openDelay={300} closeDelay={100}>
                    <Avatar.Group spacing="sm">
                      {communityInfo.data?.members.map((member) => (
                        <MemberCard key={member.id} isCreator={false} memberId={member.id} isMultiple />
                      ))}
                    </Avatar.Group>
                  </Tooltip.Group>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}