export function getGreeting(name?: string | null, fallback = "there") {
  const hour = new Date().getHours();
  let salutation = "Good Night";

  if (hour >= 5 && hour < 11) salutation = "Good Morning";
  else if (hour >= 11 && hour < 15) salutation = "Good Afternoon";
  else if (hour >= 15 && hour < 19) salutation = "Good Evening";

  return `${salutation}, ${name?.trim() || fallback}`;
}