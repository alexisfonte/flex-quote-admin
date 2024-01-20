import { clerkClient } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  userIds: {
    userId: string;
  }[];
};
async function AvatarStack({ userIds }: Props) {
  const users = userIds.map(async (user) => {
    const userInfo = await clerkClient.users.getUser(user.userId);

    return (
      <Avatar key={user.userId}>
        <AvatarImage src={userInfo.imageUrl} />
        <AvatarFallback>
          {userInfo.firstName?.charAt(0)}
          {userInfo.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    );
  });
  return <div className="flex -space-x-2 overflow-hidden">{users}</div>;
}
export default AvatarStack;
