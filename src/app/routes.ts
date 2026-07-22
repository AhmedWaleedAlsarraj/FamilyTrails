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
  AudioRecordingScreen,
  TextNoteScreen,
  SuccessScreen,
  Layout,
} from "./screens";

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
        { path: "memories", Component: MyMemoriesScreen },
        { path: "profile", Component: ProfileScreen },
        { path: "add-memory/:id", Component: AddMemorySelectionScreen },
        { path: "add-memory/:id/photo", Component: PhotoAttachmentScreen },
        { path: "add-memory/:id/video", Component: VideoAttachmentScreen },
        { path: "add-memory/:id/audio", Component: AudioRecordingScreen },
        { path: "add-memory/:id/text", Component: TextNoteScreen },
        { path: "success/:id/:type", Component: SuccessScreen },
      ],
    },
  ],
  { basename },
);
