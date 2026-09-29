import type { AssetMetadata } from "../marketplace/types";
export function AssetVotes({ votes }: { votes: AssetMetadata["votes"] }) {
  if (!votes) return <small className="asset-votes">Ratings unavailable</small>;
  const total = votes.up + votes.down;
  return (
    <small
      className="asset-votes"
      title={`${votes.up.toLocaleString()} upvotes · ${votes.down.toLocaleString()} downvotes`}
    >
      {total
        ? `👍 ${Math.round((votes.up / total) * 100)}% · ${total.toLocaleString()} votes`
        : "No votes yet"}
    </small>
  );
}
