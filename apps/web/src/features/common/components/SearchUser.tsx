import { forwardRef, useRef, useState } from "react";
import { Group, Text, Autocomplete, Loader } from "@mantine/core";
import { Search } from "tabler-icons-react";
import useSWR from "swr";
import { searchUsersSWR } from "~/utils/request";
import { ISearchItem, ISearchRes, IUser, IUserDoc } from "interfaces";
import { UserAvatar } from "./UserAvatar";
import { useDebouncedValue } from "@mantine/hooks";
import { startConversation } from "~/utils/request";
import { useChat } from "~/features/chat";
import { useAuth } from "~/features/auth";

interface AutoCompleteItem {
  value: string;
  user: ISearchItem;
}

const AutoCompleteItem = forwardRef<HTMLDivElement, AutoCompleteItem>(
  ({ user, ...others }: AutoCompleteItem, ref) => {
    return (
      <div ref={ref} {...others}>
        <Group noWrap>
          <UserAvatar user={user} />

          <div>
            <Text>{user.name}</Text>
            <Text size="xs" color="dimmed">
              {user.username}
            </Text>
          </div>
        </Group>
      </div>
    );
  }
);

AutoCompleteItem.displayName = "AutoCompleteItem";

export const SearchUser = () => {
  const [query, setQuery] = useState("");
  const [queryDebounced] = useDebouncedValue(query, 200);
  const { user } = useAuth();
  const { data: searchRes, isValidating: loading } = useSWR(
    queryDebounced && user ? ["searchUsersSWR", queryDebounced] : null,
    searchUsersSWR
  );
  const { data: suggestedData } = useSWR(
    user ? "searchUsersSWR" : null,
    searchUsersSWR
  );
  const { updateConversationList, setConversationId } = useChat();
  //ref
  const inputRef = useRef<HTMLInputElement>(null);

  const toAutoCompleteData = (data?: ISearchRes): AutoCompleteItem[] => {
    return (
      data?.map((user) => ({
        user,
        value: user._id,
      })) || []
    );
  };

  const goToConversation = async ({ value }: AutoCompleteItem) => {
    inputRef.current?.blur();
    setQuery("");
    //Look for conversation
    const conversation = await startConversation(value);

    //Update conversation list
    await updateConversationList();

    setConversationId(conversation._id);
  };

  return (
    <Autocomplete
      ref={inputRef}
      icon={<Search size={18} />}
      className="max-w-full w-[250px] sm:w-[400px] mx-3"
      rightSection={loading && <Loader size={18} />}
      placeholder="Start a conversation"
      itemComponent={AutoCompleteItem}
      onItemSubmit={goToConversation}
      value={query}
      onChange={setQuery}
      filter={() => true}
      data={
        query.length > 0
          ? toAutoCompleteData(searchRes)
          : toAutoCompleteData(suggestedData)
      }
      nothingFound={query.length > 0 && !loading ? "No users found" : null}
    />
  );
};
