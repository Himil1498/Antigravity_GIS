export const formatReportDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    let timeAgo = "";
    if (diffInHours < 1) timeAgo = "Just now";
    else if (diffInHours < 24) timeAgo = `${diffInHours}h ago`;
    else if (diffInHours < 168)
      timeAgo = `${Math.floor(diffInHours / 24)}d ago`;
    else timeAgo = `${Math.floor(diffInHours / 168)}w ago`;

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return { timeAgo, formattedDate };
  } catch (e) {
    return { timeAgo: "", formattedDate: dateString };
  }
};

