"use client";
import { followAction } from "@/app/actions/socialActions/FollowUnfollowUser/following.actions";
import { unfollowAction } from "@/app/actions/socialActions/FollowUnfollowUser/unfollow.actions";
import { useStore } from "@/lib/store/index.store";
import { UserPublicDataType } from "@/src/types/user.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRoundPlus } from "lucide-react";
import Image from "next/image";
import BentoContainer from "../bentoContainer/BentoContainer";
import PrimaryButton from "../UI/primaryButton/PrimaryButton";
import BadgeCounter from "./BadgeCounter";
import BadgeDate from "./BadgeDate";

interface ProfileBannerProps {
  data: UserPublicDataType & { alreadyFollowed: boolean };
  isMyOwnProfile: boolean;
}

interface DataFollowType {
  userId: string;
  userFollowedID: string;
}

const ProfileBanner = ({ data, isMyOwnProfile }: ProfileBannerProps) => {
  //ZUSTAND info du profil user connecté
  const userId = useStore((state) => state.userId);
  // Infos du profil consulté
  const {
    createdAt: profileCreatedAt,
    displayName: profileDisplayName,
    followedByCount: profileFollowedByCount,
    followingCount: profileFollowingCount,
    id: userFollowedID,
    image: profileImage,
    username: profileUsername,
    alreadyFollowed,
  } = data;

  //TANSTACK ini queryclient
  const queryClient = useQueryClient();

  // TANSTACK follow action + optimistic update

  const { mutate: followMutation } = useMutation({
    mutationFn: ({ userId, userFollowedID }: DataFollowType) =>
      followAction(userId, userFollowedID),
    onMutate: async () => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({
        queryKey: ["userProfile", profileUsername],
      });
      // Snapshot de l'état actuel
      const previousProfile = queryClient.getQueryData([
        "userProfile",
        profileUsername,
      ]);
      // ZUSTAND Snaptshot compteur follower zustand
      const previousFollowingCount = useStore.getState().followingCount;

      // Optimistic update
      // ZUSTAND mise à jour du compteur followingCount
      useStore.getState().updateProfile({
        followingCount: useStore.getState().followingCount + 1,
      });
      // mise à jour du cache tanstastck
      queryClient.setQueryData(
        ["userProfile", profileUsername],
        (currentData: {
          data: UserPublicDataType & { alreadyFollowed: boolean };
        }) => ({
          data: {
            ...currentData.data,
            followedByCount: currentData.data.followedByCount + 1,
            alreadyFollowed: true,
          },
        })
      );
      return { previousProfile, previousFollowingCount };
    },
    onSuccess: (response) => {
      console.log(response);
      queryClient.invalidateQueries({
        queryKey: ["userProfile", profileUsername],
      });
    },
    onError: (error, _, context) => {
      console.log(error);
      //ZUSTAND Rollback vers previousFollowingCount
      useStore.getState().updateProfile({
        followingCount: context?.previousFollowingCount,
      });

      // Rollback en cas d'erreur
      queryClient.setQueryData(
        ["userProfile", profileUsername],
        context?.previousProfile
      );
    },
    onSettled: () => {
      // Rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ["userProfile", profileUsername],
      });
    },
  });

  // TANSTACK Unfollow action
  const { mutate: unfollowMutation } = useMutation({
    mutationFn: ({ userId, userFollowedID }: DataFollowType) =>
      unfollowAction(userId, userFollowedID),
    onMutate: async () => {
      // Annuler les requête en cours
      await queryClient.cancelQueries({
        queryKey: ["userProfile", profileUsername],
      });
      // Snapshot de l'état précédent
      const previousProfile = queryClient.getQueryData([
        "userProfile",
        profileUsername,
      ]);

      //ZUSTAND snapshot de l'état précédent
      const previousFollowingCount = useStore.getState().followingCount;

      // Optimistic update
      // ZUSTAND mise à jour du compteur followingCount
      useStore.getState().updateProfile({
        followingCount: useStore.getState().followingCount - 1,
      });

      queryClient.setQueryData(
        ["userProfile", profileUsername],
        (currentData: {
          data: UserPublicDataType & { alreadyFollowed: boolean };
        }) => ({
          data: {
            ...currentData.data,
            followedByCount: currentData.data.followedByCount - 1,
            alreadyFollowed: false,
          },
        })
      );
      return { previousProfile, previousFollowingCount };
    },
    onSuccess: (response) => {
      console.log(response);
      // invalider le cache pour refetch
      queryClient.invalidateQueries({
        queryKey: [["userProfile", profileUsername], ["userSession"]],
      });
    },
    onError: (error, _, context) => {
      console.log(error);
      //ZUSTAND Rollback vers previousFollowingCount
      useStore.getState().updateProfile({
        followingCount: context?.previousFollowingCount,
      });

      // Rollback en cas d'erreur
      queryClient.setQueryData(
        ["userProfile", profileUsername],
        context?.previousProfile
      );
    },
    onSettled: () => {
      // Rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ["userProfile", profileUsername],
      });
    },
  });

  return (
    <div className="w-full h-auto flex flex-col justify-start items-center gap-2">
      <BentoContainer className="w-full h-auto flex justify-between items-center p-4 overflow-hidden">
        <div className="flex justify-between items-center w-full gap-3">
          <div className="flex justify-center items-center flex-shrink-0 gap-3">
            <Image
              className="rounded-full"
              src={profileImage || "/default_avatar/default_avatar.png"}
              width={50}
              height={50}
              alt="profil-picture"
            />
            <div className=" flex-col justify-center ">
              <p className="font-bold">{profileDisplayName}</p>
              <p className="text-xs text-textGrey">{profileUsername}</p>
            </div>
          </div>
          {/* sépration */}
          <span className="mx-2 my-1 w-px self-stretch bg-skeletonGrey"></span>
          {/* sépration */}

          <div className="w-full flex justify-center items-center flex-grow ">
            <p className="text-sm ">
              15 years • Founder & Designer at @ http://chocho.agency 💫
              Creation of landing page & Website for SaaS/Agency
            </p>
          </div>
          {!isMyOwnProfile && (
            <>
              {/* sépration */}
              <span className="mx-2 my-1 w-px self-stretch bg-skeletonGrey"></span>
              {/* sépration */}

              {userId && (
                <div className="flex justify-center items-center min-w-24 ">
                  {/* on choisi le type de bouton en fonction de l'état de la relation entre les 2 utilisateurs */}
                  {!alreadyFollowed ? (
                    <PrimaryButton
                      text="Follow"
                      onClick={() => followMutation({ userId, userFollowedID })}
                    >
                      <UserRoundPlus size={20} />
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      text="Unfollow"
                      onClick={() =>
                        unfollowMutation({ userId, userFollowedID })
                      }
                    >
                      <UserRoundPlus size={20} />
                    </PrimaryButton>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </BentoContainer>
      <div className="w-full h-auto  flex justify-start items-center gap-3">
        <BadgeCounter text={"Followers"} counter={profileFollowedByCount} />
        <BadgeCounter text={"Following"} counter={profileFollowingCount} />
        <BadgeDate
          text="Joined reello in"
          date={profileCreatedAt ?? new Date()}
        />
      </div>
    </div>
  );
};

export default ProfileBanner;
