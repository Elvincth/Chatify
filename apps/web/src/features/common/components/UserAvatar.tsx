import { Avatar, useMantineTheme } from "@mantine/core";
import { IUserDoc, JWTUser, IUser, ISearchItem } from "interfaces";
import { useState, useEffect } from "react";
import { textToColorScheme } from "~/utils/ui";

interface IUserAvatarProps {
  user?: JWTUser | IUserDoc | IUser | ISearchItem;
}

// export const UserAvatar = ({ user }: IUserAvatarProps) => {
//     return (
//         <Avatar color={textToColorScheme(user?.username ?? "")} radius="xl">
//             {getInitial(user?.username ?? "")}
//         </Avatar>
//     );
// }

export const UserAvatar = ({ user }: IUserAvatarProps) => {
  const theme = useMantineTheme();
  const [color, setColor] = useState(theme.colors.blue[5]);

  useEffect(() => {
    if (user) {
      setColor(theme.colors[textToColorScheme(user.username)][4]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const url = `https://avatars.dicebear.com/api/miniavs/${
    user?.name
  }.svg?backgroundColor=%23${color.replace("#", "")}&skinColor=white`;
  return <Avatar radius={9999} src={url} />;
};
