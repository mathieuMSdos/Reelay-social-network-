import { followAction } from "@/app/actions/socialActions/following.actions";
import { useStore } from "@/lib/store/index.store";
import { UserPublicDataType } from "@/src/types/user.types";
import { UserRoundPlus } from "lucide-react";
import Image from "next/image";
import BentoContainer from "../bentoContainer/BentoContainer";
import PrimaryButton from "../UI/primaryButton/PrimaryButton";

interface ProfileBannerProps {
  data: UserPublicDataType;
}

const ProfileBanner = ({ data }: ProfileBannerProps) => {
  //ZUSTAND info du profil user connecté
  const userId = useStore((state) => state.userId);
  // Infos du profil consulté
  const {
    createdAt: profileCreatedAt,
    displayName: profileDisplayName,
    followedByCount: profileFollowedByCount,
    followingCount: profileFollowingCount,
    id: profileId,
    image: profileImage,
    name: profileName,
    username: profileUsername,
  } = data;

  const handleFollow = async (userID: string, userFollowedID: string) => {
    // server action follow
   const result = await followAction(userID, userFollowedID);

   console.log(result)
  };

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

          <div className="flex justify-center items-center flex-grow ">
            <p className="text-sm text-center">
              15 years • Founder & Designer at @ http://chocho.agency 💫
              Creation of landing page & Website for SaaS/Agency
            </p>
          </div>
          {/* sépration */}
          <span className="mx-2 my-1 w-px self-stretch bg-skeletonGrey"></span>
          {/* sépration */}

          <div className="flex justify-center items-center min-w-24 ">
            <PrimaryButton
              text="Follow"
              onClick={() => handleFollow(userId, profileId)}
            >
              <UserRoundPlus size={20} />
            </PrimaryButton>
          </div>
        </div>
      </BentoContainer>
      <div className="w-full h-auto flex justify-start">badge</div>
    </div>
  );
};

export default ProfileBanner;
