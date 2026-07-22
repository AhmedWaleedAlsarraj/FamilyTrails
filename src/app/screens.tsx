import React, { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Search,
  Clock,
  Calendar,
  Ruler,
  Camera,
  Video,
  Mic,
  FileText,
  X,
  CheckCircle2,
  Square,
  Compass,
  Share2,
  Eye,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ImageWithFallback } from "./components/FamilyTrails/ImageWithFallback";
import { POIS } from "./data/poi";
import { BottomNav } from "./components/BottomNav";
import { useApp } from "./App";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            "w-5 h-5",
            star <= Math.round(rating)
              ? "text-[#FFB800] fill-current"
              : "text-gray-300 fill-current",
          )}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm font-bold text-gray-700 ml-1.5">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const formatViews = (views: number): string => {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
};

const handleSharePOI = (poi: { name: string; id: string }) => {
  const url = `${window.location.origin}${window.location.pathname.replace(/\/poi\/.*/, "")}/poi/${poi.id}`;
  if (navigator.share) {
    navigator
      .share({
        title: poi.name,
        text: `Check out ${poi.name} on FamilyTrails!`,
        url,
      })
      .catch(() => {});
  } else {
    navigator.clipboard
      ?.writeText(url)
      .then(() => alert("Link copied!"))
      .catch(() => alert(`Share: ${poi.name}`));
  }
};

export const Layout = () => {
  return (
    <div className="flex flex-col h-screen w-screen max-w-[430px] mx-auto bg-[#F8F9FA] relative shadow-2xl overflow-hidden">
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-[100px]">
        <Outlet />
      </main>
      <div className="w-full shrink-0 sticky bottom-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export const HomeScreen = () => {
  const navigate = useNavigate();
  const featured = POIS.slice(0, 3);
  return (
    <div className="flex flex-col min-h-full pb-6">
      <header className="bg-[#2E5C8A] pt-4 pb-12 px-5 flex items-center justify-between text-white relative">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <h1 className="text-xl font-bold tracking-tight">FamilyTrails</h1>
        </div>
        <button className="p-2 bg-white/10 rounded-full">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="px-5 -mt-8 relative z-10">
        <div className="bg-gradient-to-br from-[#2E5C8A] to-[#1e3c5a] p-6 rounded-2xl shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-white/80 text-sm">Ready to explore Bahrain?</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="px-5 flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Nearby Attractions</h3>
          <button
            onClick={() => navigate("/explore")}
            className="text-sm font-semibold text-[#FF6B35]"
          >
            See All
          </button>
        </div>

        <div className="px-5 space-y-4">
          {featured.map((poi) => (
            <motion.div
              key={poi.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/poi/${poi.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer"
            >
              <div className="relative h-[180px]">
                <ImageWithFallback
                  src={poi.imageUrl}
                  alt={poi.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="text-[10px] font-bold text-[#2E5C8A] uppercase tracking-wider">
                    {poi.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h4 className="text-white font-bold text-lg">{poi.name}</h4>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs">{poi.distance} away</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-xs">{formatViews(poi.views)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSharePOI(poi);
                      }}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#2E5C8A]" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {poi.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5 pb-6">
        <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center justify-center gap-2 bg-[#2E5C8A] text-white py-4 px-4 rounded-xl font-bold shadow-sm"
          >
            <Compass className="w-5 h-5" />
            <span>Browse All</span>
          </button>
          <button
            onClick={() => navigate("/memories")}
            className="flex items-center justify-center gap-2 border-2 border-[#2E5C8A] text-[#2E5C8A] py-4 px-4 rounded-xl font-bold"
          >
            <Camera className="w-5 h-5" />
            <span>My Memories</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export const ExploreScreen = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filters = [
    "All",
    "Monument",
    "Museum",
    "Parks & Nature",
    "Historic Site",
  ];

  const filteredPOIs = POIS.filter((poi) => {
    const matchesFilter =
      activeFilter === "All" || poi.category === activeFilter;
    const matchesSearch = poi.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="bg-[#2E5C8A] pt-4 pb-6 px-5 text-white shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Explore Bahrain</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search attractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-black pl-12 pr-4 py-3.5 rounded-2xl border-none focus:ring-2 focus:ring-[#FF6B35] shadow-inner outline-none"
          />
        </div>
      </header>

      <div
        className="flex overflow-x-auto gap-2 px-5 py-4 shrink-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0",
              activeFilter === f
                ? "bg-[#2E5C8A] text-white shadow-md"
                : "bg-[#F0F4F8] text-[#2E5C8A]",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-5 pb-6 space-y-4">
        {filteredPOIs.map((poi) => (
          <motion.div
            key={poi.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/poi/${poi.id}`)}
            className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-3 items-center gap-4 cursor-pointer hover:border-[#2E5C8A] transition-colors"
          >
            <ImageWithFallback
              src={poi.imageUrl}
              alt={poi.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-bold text-black truncate">{poi.name}</h4>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSharePOI(poi);
                    }}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#2E5C8A]" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                  {poi.category}
                </span>
                <span className="text-[11px] text-gray-400">
                  {poi.distance}
                </span>
                <div className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span className="text-[11px]">{formatViews(poi.views)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const POIDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemoriesByPOI, deleteMemory } = useApp();
  const poi = POIS.find((p) => p.id === id);
  const memories = getMemoriesByPOI(id || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!poi) return null;

  const detailItems = [];
  if (poi.details.built)
    detailItems.push({
      icon: Calendar,
      label: "Built",
      value: poi.details.built,
    });
  if (poi.details.height)
    detailItems.push({
      icon: Ruler,
      label: "Height",
      value: poi.details.height,
    });
  if (poi.details.open)
    detailItems.push({ icon: Clock, label: "Open", value: poi.details.open });
  if (poi.details.access)
    detailItems.push({
      icon: Clock,
      label: "Access",
      value: poi.details.access,
    });
  if (poi.details.entry)
    detailItems.push({
      icon: MapPin,
      label: "Entry",
      value: poi.details.entry,
    });

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: poi.name,
          text: `Check out ${poi.name} on FamilyTrails!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      alert(`Share ${poi.name}`);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="relative h-[300px] shrink-0">
        <ImageWithFallback
          src={poi.imageUrl}
          alt={poi.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-10 pb-12">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-50 mb-6">
          <span className="px-2.5 py-1 rounded-full bg-[#2E5C8A]/10 text-[#2E5C8A] text-[10px] font-bold uppercase mb-2 inline-block">
            {poi.category}
          </span>

          <h1 className="text-2xl font-black text-black mb-3">{poi.name}</h1>

          <div className="flex items-center justify-between mb-4">
            {poi.rating && <StarRating rating={poi.rating} />}
            <div className="flex items-center gap-1.5 text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold text-gray-500">
                {formatViews(poi.views)} views
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>{poi.location}</span>
          </div>

          {detailItems.length > 0 && (
            <div
              className={`grid gap-3 mb-8 ${detailItems.length <= 3 ? "grid-cols-3" : "grid-cols-2"}`}
            >
              {detailItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#F8F9FA] p-3 rounded-2xl text-center"
                >
                  <item.icon className="w-5 h-5 mx-auto text-[#2E5C8A] mb-1" />
                  <span className="text-[10px] block text-gray-400 uppercase">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {poi.details.features && poi.details.features.length > 0 && (
            <div className="bg-[#F8F9FA] p-4 rounded-2xl mb-8">
              <p className="text-[10px] text-gray-400 mb-2 font-bold">
                FEATURES
              </p>
              <div className="flex flex-wrap gap-2">
                {poi.details.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white px-3 py-1.5 rounded-full text-gray-700 font-medium border border-gray-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-600 leading-relaxed mb-8 text-sm">
            {poi.fullDescription}
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/add-memory/${poi.id}`)}
            className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg font-bold"
          >
            <Camera className="w-6 h-6" />
            <span>Add Your Memory</span>
          </motion.button>
        </div>

        {memories.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-black mb-4 px-1">
              Family Memories Here
            </h2>
            <div className="space-y-4 mb-6">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E5C8A] to-[#4A7BA7] flex items-center justify-center font-bold text-xs text-white">
                      FT
                    </div>
                    <span className="text-xs font-bold">Explorer</span>
                    <span className="text-[10px] text-gray-400 flex-1">
                      {m.date}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 bg-white shadow-lg border border-gray-200 rounded-xl p-1"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            if (window.confirm("Delete this memory?"))
                              deleteMemory(m.id);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 font-semibold text-sm bg-white hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {m.type === "photo" && m.content && (
                    <div
                      onClick={() => setSelectedImage(m.content)}
                      className="cursor-pointer"
                    >
                      <ImageWithFallback
                        src={m.content}
                        alt="Memory"
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                    </div>
                  )}
                  {m.type === "video" && m.content && (
                    <video
                      src={m.content}
                      controls
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                  )}
                  {m.caption && (
                    <p className="text-sm text-gray-600 italic mt-2">
                      "{m.caption}"
                    </p>
                  )}
                  {m.type === "text" && (
                    <p className="text-sm text-gray-600 italic">
                      "{m.content}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="absolute inset-0 bg-black/90 z-[100] flex items-center justify-center"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full max-h-full object-contain rounded-xl px-4"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AddMemorySelectionScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const poi = POIS.find((p) => p.id === id);
  if (!poi) return null;

  const types = [
    {
      type: "photo",
      icon: Camera,
      label: "Add Photo",
      desc: "Capture the landmark",
    },
    {
      type: "video",
      icon: Video,
      label: "Record Video",
      desc: "Share your experience",
    },
    {
      type: "text",
      icon: FileText,
      label: "Write Note",
      desc: "Reflect on your visit",
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-6">
      <header className="flex items-center justify-between py-6 shrink-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Add Memory</h1>
        <button onClick={() => navigate(`/poi/${id}`)}>
          <X />
        </button>
      </header>

      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl mb-8">
        <ImageWithFallback
          src={poi.imageUrl}
          alt="P"
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div>
          <p className="text-[10px] text-gray-400">Adding to:</p>
          <h2 className="text-sm font-bold">{poi.name}</h2>
        </div>
      </div>

      <div className="space-y-4">
        {types.map((t) => (
          <button
            key={t.type}
            onClick={() => navigate(`/add-memory/${id}/${t.type}`)}
            className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-[#2E5C8A] transition-colors"
          >
            <t.icon className="w-8 h-8 text-[#2E5C8A]" />
            <div className="text-left flex-1">
              <h3 className="font-bold">{t.label}</h3>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const PhotoAttachmentScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addMemory } = useApp();
  const poi = POIS.find((p) => p.id === id);
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const handleSave = () => {
    if (!photo || !poi) return;
    addMemory({
      poiId: poi.id,
      poiName: poi.name,
      type: "photo",
      content: photo,
      caption,
    });
    navigate(`/success/${poi.id}/photo`);
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-6">
      <header className="flex items-center justify-between py-6 shrink-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Add Photo</h1>
        <div className="w-6" />
      </header>

      <div className="text-center text-xs text-gray-400 mb-4">{poi?.name}</div>

      <div
        className={cn(
          "w-full aspect-[4/5] rounded-3xl mb-6 flex flex-col items-center justify-center shrink-0",
          photo
            ? "bg-black"
            : "bg-gray-100 border-2 border-dashed border-gray-200",
        )}
      >
        {photo ? (
          <ImageWithFallback
            src={photo}
            alt="P"
            className="w-full h-full object-cover rounded-3xl"
          />
        ) : (
          <div className="flex flex-col items-center">
            <Camera className="text-gray-300 w-12 h-12 mb-3" />
            <p className="text-xs text-gray-400">Tap below to add a photo</p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="photo-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPhoto(URL.createObjectURL(file));
        }}
      />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <label
          htmlFor="photo-input"
          onClick={() => {
            const input = document.getElementById(
              "photo-input",
            ) as HTMLInputElement;
            if (input) input.setAttribute("capture", "environment");
          }}
          className="bg-[#2E5C8A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          Take Photo
        </label>
        <label
          htmlFor="photo-input"
          onClick={() => {
            const input = document.getElementById(
              "photo-input",
            ) as HTMLInputElement;
            if (input) input.removeAttribute("capture");
          }}
          className="border-2 border-[#2E5C8A] text-[#2E5C8A] py-4 rounded-xl font-bold flex items-center justify-center cursor-pointer"
        >
          Gallery
        </label>
      </div>

      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-2 block font-medium">
          Add a caption (optional)
        </label>
        <textarea
          placeholder="Describe your memory..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none resize-none"
          rows={3}
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {caption.length}/200
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!photo}
          className={cn(
            "flex-1 py-4 rounded-2xl font-bold transition-all",
            photo
              ? "bg-[#2E5C8A] text-white shadow-md"
              : "bg-gray-100 text-gray-400",
          )}
        >
          Save Memory
        </button>
      </div>
    </div>
  );
};

export const VideoAttachmentScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addMemory } = useApp();
  const poi = POIS.find((p) => p.id === id);
  const [video, setVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const handleSave = () => {
    if (!video || !poi) return;
    addMemory({
      poiId: poi.id,
      poiName: poi.name,
      type: "video",
      content: video,
      caption,
    });
    navigate(`/success/${poi.id}/video`);
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-6">
      <header className="flex items-center justify-between py-6 shrink-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Add Video</h1>
        <div className="w-6" />
      </header>

      <div className="text-center text-xs text-gray-400 mb-4">{poi?.name}</div>

      <div
        className={cn(
          "w-full aspect-[4/5] rounded-3xl mb-6 flex flex-col items-center justify-center shrink-0 relative overflow-hidden",
          video
            ? "bg-black"
            : "bg-gray-100 border-2 border-dashed border-gray-200",
        )}
      >
        {video ? (
          <video
            src={video}
            controls
            className="w-full h-full object-cover rounded-3xl"
          />
        ) : (
          <div className="flex flex-col items-center">
            <Video className="text-gray-300 w-12 h-12 mb-3" />
            <p className="text-xs text-gray-400">Tap below to add a video</p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="video/*"
        className="hidden"
        id="video-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setVideo(URL.createObjectURL(file));
        }}
      />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <label
          htmlFor="video-input"
          onClick={() => {
            const input = document.getElementById(
              "video-input",
            ) as HTMLInputElement;
            if (input) input.setAttribute("capture", "environment");
          }}
          className="bg-[#2E5C8A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Video className="w-4 h-4" />
          Record
        </label>
        <label
          htmlFor="video-input"
          onClick={() => {
            const input = document.getElementById(
              "video-input",
            ) as HTMLInputElement;
            if (input) input.removeAttribute("capture");
          }}
          className="border-2 border-[#2E5C8A] text-[#2E5C8A] py-4 rounded-xl font-bold flex items-center justify-center cursor-pointer"
        >
          Gallery
        </label>
      </div>

      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-2 block font-medium">
          Add a caption (optional)
        </label>
        <textarea
          placeholder="Describe your memory..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none resize-none"
          rows={3}
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {caption.length}/200
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!video}
          className={cn(
            "flex-1 py-4 rounded-2xl font-bold transition-all",
            video
              ? "bg-[#2E5C8A] text-white shadow-md"
              : "bg-gray-100 text-gray-400",
          )}
        >
          Save Memory
        </button>
      </div>
    </div>
  );
};

export const AudioRecordingScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addMemory } = useApp();
  const poi = POIS.find((p) => p.id === id);
  const [status, setStatus] = useState<"idle" | "recording" | "complete">(
    "idle",
  );
  const [caption, setCaption] = useState("");

  const handleSave = () => {
    if (!poi || status === "idle") return;
    addMemory({
      poiId: poi.id,
      poiName: poi.name,
      type: "audio",
      content: "audio_recording",
      caption,
    });
    navigate(`/success/${poi.id}/audio`);
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-6">
      <header className="flex items-center justify-between py-6 shrink-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Record Audio</h1>
        <div className="w-6" />
      </header>

      <div className="text-center text-xs text-gray-400 mb-6">{poi?.name}</div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div
          className={cn(
            "w-40 h-40 rounded-full flex items-center justify-center mb-8 transition-all",
            status === "recording"
              ? "bg-red-50 text-red-500 animate-pulse"
              : "bg-blue-50 text-[#2E5C8A]",
          )}
        >
          <Mic className="w-16 h-16" />
        </div>
        <p className="text-lg font-bold mb-2 text-gray-800">
          {status === "idle" && "Ready to Record"}
          {status === "recording" && "Recording..."}
          {status === "complete" && "Recording Complete"}
        </p>
        <p className="text-3xl font-mono mb-12 text-gray-600 font-bold">
          {status === "recording" ? "0:15" : "0:00"}
        </p>
        <button
          onClick={() =>
            setStatus(status === "recording" ? "complete" : "recording")
          }
          className={cn(
            "w-20 h-20 rounded-full shadow-xl flex items-center justify-center transition-all",
            status === "recording"
              ? "bg-[#2E5C8A] text-white"
              : "bg-red-500 text-white",
          )}
        >
          {status === "recording" ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <div className="w-7 h-7 rounded-full border-[5px] border-white" />
          )}
        </button>
      </div>

      {status === "complete" && (
        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-2 block font-medium">
            Add a note (optional)
          </label>
          <textarea
            placeholder="Add context..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none resize-none"
            rows={2}
          />
          <div className="text-xs text-gray-400 text-right mt-1">
            {caption.length}/200
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={status === "idle"}
          className={cn(
            "flex-1 py-4 rounded-2xl font-bold transition-all",
            status !== "idle"
              ? "bg-[#2E5C8A] text-white shadow-md"
              : "bg-gray-100 text-gray-400",
          )}
        >
          Save Audio
        </button>
      </div>
    </div>
  );
};

export const TextNoteScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addMemory } = useApp();
  const poi = POIS.find((p) => p.id === id);
  const [text, setText] = useState("");

  const handleSave = () => {
    if (!poi || !text) return;
    addMemory({
      poiId: poi.id,
      poiName: poi.name,
      type: "text",
      content: text,
    });
    navigate(`/success/${poi.id}/text`);
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-6">
      <header className="flex items-center justify-between py-6 shrink-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Write Note</h1>
        <div className="w-6" />
      </header>

      <div className="text-center text-xs text-gray-400 mb-4">{poi?.name}</div>

      <textarea
        autoFocus
        placeholder="What did you think of this place? Share your family's experience..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        className="flex-1 bg-gray-50 p-6 rounded-3xl text-base outline-none border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] resize-none min-h-[350px]"
      />

      <div className="text-xs text-gray-400 text-right mb-6 mt-2">
        {text.length}/500
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!text}
          className={cn(
            "flex-1 py-4 rounded-2xl font-bold transition-all",
            text
              ? "bg-[#2E5C8A] text-white shadow-md"
              : "bg-gray-100 text-gray-400",
          )}
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

export const SuccessScreen = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const poi = POIS.find((p) => p.id === id);

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-white px-8 text-center py-12">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-[#4CAF50] text-white flex items-center justify-center mb-6 shadow-xl">
          <CheckCircle2 className="w-14 h-14" />
        </div>
        <h1 className="text-4xl font-black mb-3 text-gray-900">
          Memory Saved!
        </h1>
        <p className="text-gray-500 mb-12 text-base max-w-[280px]">
          Your {type} has been added to{" "}
          <span className="font-bold text-gray-900">{poi?.name}</span>
        </p>
      </div>

      <div className="w-full space-y-4 max-w-[320px]">
        <button
          onClick={() => navigate(`/poi/${id}`)}
          className="w-full bg-[#2E5C8A] text-white py-4 rounded-2xl font-bold shadow-md"
        >
          View {poi?.name}
        </button>
        <button
          onClick={() => navigate(`/add-memory/${id}`)}
          className="w-full border-2 border-[#2E5C8A] text-[#2E5C8A] py-4 rounded-2xl font-bold"
        >
          Add Another Memory
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full text-gray-500 font-semibold py-3"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export const MyMemoriesScreen = () => {
  const { memories, deleteMemory } = useApp();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Photos", "Videos", "Text"];

  const filteredMemories = memories.filter((m) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Photos") return m.type === "photo";
    if (activeFilter === "Videos") return m.type === "video";
    if (activeFilter === "Text") return m.type === "text";
    return true;
  });

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="bg-[#2E5C8A] p-6 text-white shrink-0">
        <h1 className="text-2xl font-black">My Memories</h1>
        <p className="text-sm text-white/80 mt-1">
          Your Bahrain family adventures
        </p>
      </header>

      <div
        className="flex overflow-x-auto gap-2 px-5 py-4 bg-white border-b shrink-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0",
              activeFilter === f
                ? "bg-[#2E5C8A] text-white shadow-sm"
                : "bg-gray-100 text-gray-600",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4 pb-8">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Camera className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold mb-2 text-gray-900">
              {activeFilter === "All"
                ? "No memories yet"
                : `No ${activeFilter.toLowerCase()} yet`}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[250px]">
              {activeFilter === "All"
                ? "Visit a point of interest and add your first memory!"
                : `Add a ${activeFilter.toLowerCase().slice(0, -1)} to see it here!`}
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="bg-[#2E5C8A] text-white px-6 py-3 rounded-xl font-bold shadow-md"
            >
              Explore Bahrain
            </button>
          </div>
        ) : (
          filteredMemories.map((m) => (
            <div
              key={m.id}
              className="flex gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm items-center"
            >
              <div
                onClick={() => navigate(`/poi/${m.poiId}`)}
                className="flex gap-4 items-center flex-1 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#2E5C8A]/10 to-[#4A7BA7]/10 rounded-xl flex items-center justify-center shrink-0">
                  {m.type === "photo" && (
                    <Camera className="text-[#2E5C8A] w-7 h-7" />
                  )}
                  {m.type === "video" && (
                    <Video className="text-[#2E5C8A] w-7 h-7" />
                  )}
                  {m.type === "text" && (
                    <FileText className="text-[#2E5C8A] w-7 h-7" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate text-gray-900">
                    {m.poiName}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {m.type === "photo" && "📷 Photo"}
                    {m.type === "video" && "🎥 Video"}
                    {m.type === "text" && "📝 Text"}
                    {" • "}
                    {m.date}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shrink-0"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 bg-white shadow-lg border border-gray-200 rounded-xl p-1"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      if (window.confirm(`Delete this ${m.type} memory?`))
                        deleteMemory(m.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 font-semibold text-sm bg-white hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const ProfileScreen = () => {
  const { memories } = useApp();
  const photoCount = memories.filter((m) => m.type === "photo").length;
  const totalPlaces = new Set(memories.map((m) => m.poiId)).size;

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="bg-[#2E5C8A] p-6 text-white shrink-0">
        <h1 className="text-2xl font-black">Profile</h1>
      </header>

      <div className="flex flex-col items-center py-8 mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E5C8A] to-[#4A7BA7] flex items-center justify-center text-3xl font-black text-white mb-4 shadow-lg">
          U
        </div>
        <h2 className="text-xl font-bold text-gray-900">User</h2>
        <p className="text-sm text-gray-500 mt-1">Bahrain Explorer</p>
      </div>

      <div className="grid grid-cols-3 gap-4 px-5 mb-8">
        <div className="bg-gradient-to-br from-[#F8F9FA] to-gray-100 p-4 rounded-2xl text-center border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-[#2E5C8A]">
            {memories.length}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Memories</p>
        </div>
        <div className="bg-gradient-to-br from-[#F8F9FA] to-gray-100 p-4 rounded-2xl text-center border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-[#2E5C8A]">{totalPlaces}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Places</p>
        </div>
        <div className="bg-gradient-to-br from-[#F8F9FA] to-gray-100 p-4 rounded-2xl text-center border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-[#2E5C8A]">{photoCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Photos</p>
        </div>
      </div>

      <div className="px-5 space-y-2 pb-8">
        {[
          "Privacy Settings",
          "Notification Preferences",
          "Help & Support",
          "About FamilyTrails",
        ].map((item) => (
          <button
            key={item}
            className="w-full text-left p-4 bg-gray-50 rounded-2xl font-semibold text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span>{item}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
        <button className="w-full text-left p-4 bg-red-50 rounded-2xl font-semibold text-red-600 mt-4 hover:bg-red-100 transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
};
