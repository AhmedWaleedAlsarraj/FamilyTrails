import { createBrowserRouter } from "react-router-dom";
import {
  HomeScreen,
  ExploreScreen,
  POIDetailScreen,
  MyMemoriesScreen,
  ProfileScreen,
  AddMemorySelectionScreen,
  PhotoAttachmentScreen,
  VideoAttachmentScreen,
  TextNoteScreen,
  SuccessScreen,
  Layout,
} from "./screens";
import { LoginScreen, SignupScreen, ForgotPasswordScreen, ResetPasswordScreen } from "./Auth";
import { RequireAuth } from "./RequireAuth";
import {
  EditProfileScreen,
  SettingsScreen,
  PrivacyScreen,
  HelpScreen,
  AboutScreen,
} from "./ProfileScreens";

const basename = import.meta.env.PROD ? "/bh_app/" : "/";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: HomeScreen },
        { path: "explore", Component: ExploreScreen },
        { path: "poi/:id", Component: POIDetailScreen },
        { path: "login", Component: LoginScreen },
        { path: "signup", Component: SignupScreen },
        { path: "forgot-password", Component: ForgotPasswordScreen },
        { path: "reset-password", Component: ResetPasswordScreen },
        {
          path: "memories",
          element: (
            <RequireAuth>
              <MyMemoriesScreen />
            </RequireAuth>
          ),
        },
        {
          path: "profile",
          element: (
            <RequireAuth>
              <ProfileScreen />
            </RequireAuth>
          ),
        },
        {
          path: "profile/edit",
          element: (
            <RequireAuth>
              <EditProfileScreen />
            </RequireAuth>
          ),
        },
        {
          path: "profile/settings",
          element: (
            <RequireAuth>
              <SettingsScreen />
            </RequireAuth>
          ),
        },
        {
          path: "profile/privacy",
          element: (
            <RequireAuth>
              <PrivacyScreen />
            </RequireAuth>
          ),
        },
        {
          path: "profile/help",
          element: (
            <RequireAuth>
              <HelpScreen />
            </RequireAuth>
          ),
        },
        {
          path: "profile/about",
          element: (
            <RequireAuth>
              <AboutScreen />
            </RequireAuth>
          ),
        },
        {
          path: "add-memory/:id",
          element: (
            <RequireAuth>
              <AddMemorySelectionScreen />
            </RequireAuth>
          ),
        },
        {
          path: "add-memory/:id/photo",
          element: (
            <RequireAuth>
              <PhotoAttachmentScreen />
            </RequireAuth>
          ),
        },
        {
          path: "add-memory/:id/video",
          element: (
            <RequireAuth>
              <VideoAttachmentScreen />
            </RequireAuth>
          ),
        },
        {
          path: "add-memory/:id/text",
          element: (
            <RequireAuth>
              <TextNoteScreen />
            </RequireAuth>
          ),
        },
        { path: "success/:id/:type", Component: SuccessScreen },
      ],
    },
  ],
  { basename },
);
