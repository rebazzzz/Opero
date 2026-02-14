/*
  Example frontend fetch for GET /notifications with bearer token.
  Usage:
    await fetchNotifications({
      apiBaseUrl: "http://localhost:4000",
      accessToken: "<valid_access_token>",
      unreadOnly: true
    });
*/

export const fetchNotifications = async ({ apiBaseUrl, accessToken, unreadOnly = false }) => {
  const url = new URL(`${apiBaseUrl}/notifications`);
  if (unreadOnly) {
    url.searchParams.set("unreadOnly", "true");
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await response.json();
  console.log("Notifications response:", json);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return json;
};

export const markNotificationAsRead = async ({ apiBaseUrl, accessToken, notificationId }) => {
  const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await response.json();
  console.log("Mark as read response:", json);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return json;
};

export const markAllNotificationsAsRead = async ({ apiBaseUrl, accessToken }) => {
  const response = await fetch(`${apiBaseUrl}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await response.json();
  console.log("Mark all as read response:", json);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return json;
};

/*
  Socket.IO client example for notification:new:

  import { io } from "socket.io-client";
  const socket = io("http://localhost:4000", {
    auth: { token: "<valid_access_token>" },
    transports: ["websocket"]
  });
  socket.on("notification:new", (payload) => {
    console.log("notification:new", payload);
  });
  socket.on("notification:read", (payload) => {
    console.log("notification:read", payload);
  });
*/
