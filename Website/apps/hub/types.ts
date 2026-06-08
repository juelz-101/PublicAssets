// types.ts

export enum Tab {
  Home = 'Home',
  Music = 'Music',
  Art = 'Art',
  Tools = 'Tools',
  Gaming = 'Gaming',
  Community = 'Community',
  Library = 'Library',
  About = 'About Us',
}

export enum AboutSideTab {
  WhoWeAre = 'Who We Are',
  MeetTheTeam = 'Meet the Team',
  ContactUs = 'Contact Us',
  SubmitYourWork = 'Submit Your Work',
  JoinOurCrew = 'Join Our Crew',
}

// --- Navigation Hierarchy System ---
export interface NavItem<T extends string> {
  id: T;
  label: string;
  children?: NavItem<T>[];
  isRoot?: boolean;
}

// --- Dynamic Layout System ---
export type LayoutBlockType = 'hero' | 'grid' | 'accordion' | 'markdown';

export interface LayoutBlock {
    type: LayoutBlockType;
    title?: string;
    content?: string; 
    items?: any[];    
    config?: {
        columns?: number;
        variant?: 'default' | 'compact' | 'featured';
    };
}

export interface DynamicPageData {
    name: string;
    thumbnail: string;
    summary: string;
    blocks: LayoutBlock[];
}

// --- Safe Mode Types ---

export interface SafeModeImageOverride {
    block_all_images: boolean;
    limit_image_requests: {
        on: boolean;
        max: number;
        mode: 'per_page' | 'session';
    };
    block_background: {
        on: boolean;
        mode: 'one_and_done' | 'total_block';
    };
    pages: {
        on: boolean;
        pages: { use: boolean; page: string; mode: string; val: number }[];
    };
}

export interface SafeModeDataOverride {
    block_all_online_data: boolean;
    block_local_data: boolean;
}

export interface SafeModePerformanceOverride {
    reduced_motion: boolean;
    low_bandwidth_mode: boolean;
}

export interface SafeModeSettings {
    on: boolean;
    override: {
        images: SafeModeImageOverride;
        data: SafeModeDataOverride;
        performance: SafeModePerformanceOverride;
    };
}

// --- Manifest Types ---

export interface ManifestUISettings {
  show_ui_on_load: boolean;
  layout: {
    padding_base_unit_px: number;
    main_content_padding_multiplier: number;
    panel_padding_multiplier: number;
    panel_border_radius_px: number;
    panel_ring_opacity_percent: number;
  };
  effects: {
    background_blur_px: number;
    header_blur_px: number;
    footer_blur_px: number;
    hud_blur_px: number;
    enable_glow_effect: boolean;
    glow_primary_color_rgba: string;
    glow_primary_opacity_percent: number;
  };
  backgrounds: {
    allow_auto_change: boolean;
    per_page_switching: boolean;
    change_interval_min_seconds: number;
    change_interval_max_seconds: number;
  };
}

export interface Manifest {
  meta: any;
  settings: {
    site?: {
      default_tab?: string;
    };
    content?: {
      show_debug_items_by_default?: boolean;
    };
    ui?: ManifestUISettings;
    safe_mode: SafeModeSettings;
  };
  data: {
    git: {
        user: string;
        repo: string;
        branch: string;
        root: string;
        note: string;
    };
    data: {
      type: string;
      get: string[];
      dir: string;
    };
    cfg: {
        master_config: { use: boolean; source: string; url: string };
        debug: { on: boolean; show_data_forms: boolean; show_debug_icon: boolean };
    };
    images: {
        logos?: {
          type: string;
          dir: string;
          main_logo: string;
          [key: string]: any;
        };
        backgrounds: {
          [key: string]: string;
        };
        misc: {
          album_art_dir: string;
          html_dir: string;
          placeholders: {
            [key: string]: any;
          };
        };
    };
    library: {
      type: string;
      dir: string;
    };
  };
}

// --- Music Page Types ---

export enum MusicSideTab {
  Introduction = 'Introduction',
  Songs = 'Songs',
  Albums = 'Albums',
  Artists = 'Artists',
  JuelzFM = 'Juelz-FM',
  JuelzFM_Live = 'FM Live',
  JuelzFM_Schedule = 'FM Schedule',
  JuelzFM_Archives = 'FM Archives',
  FilmMusic = 'Film Music',
  Film_TheVoid = 'The Void OST',
  Film_NeonNights = 'Neon Nights',
  GamingMusic = 'Gaming Music',
  Game_LoFiRunner = 'Lo-Fi Runner OST',
  Game_ZikyQuest = 'Ziky Quest OST',
}

export interface ArtistLink {
  artist: string;
  link: string;
}

export interface AlbumLink {
  album: string;
  song?: string;
  track: number;
  cd: number;
  link: string;
}

export interface Song {
  title: string;
  artist: string;
  description: string;
  thumbnail: string;
  link: string;
  genre: string[];
  albums: { album: string; track: number; cd: number, link: string }[];
  soundcloud?: string;
  youtube?: string;
  other_links?: any[];
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface Album {
  album: string;
  thumbnail: string;
  link: string;
  genre: string[];
  artists: ArtistLink[];
  tracklist: {
    [cd: string]: {
      number: number;
      title: string;
      artists: ArtistLink[];
      link: string;
      thumbnail: string;
    }[];
  };
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface Artist {
  artist: string;
  thumbnail: string;
  link: string;
  genre: string[];
  albums: AlbumLink[];
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface MusicPageData {
  intro: string;
  new_releases: any[];
  albums: Album[];
  artists: Artist[];
  songs: Song[];
  juelz_fm?: {
      root: DynamicPageData;
      live?: DynamicPageData;
      schedule?: DynamicPageData;
      archives?: DynamicPageData;
  };
  film_music?: {
      root: { name: string; thumbnail: string; summary: string };
      projects: { [key: string]: Album };
  };
  game_music?: {
      root: { name: string; thumbnail: string; summary: string };
      projects: { [key: string]: Album };
  };
}

// --- Art Page Types ---

export enum ArtSideTab {
  Introduction = 'Introduction',
  Canvas = 'Canvas Art',
  Street = 'Street Art',
  Digital = 'Digital Art',
  Artists = 'Artists'
}

export interface ArtPiece {
    title: string;
    artist: string;
    artist_link?: string;
    thumbnail: string;
    link: string;
    year: string;
    medium: string;
    summary: string;
    tags?: string[];
    flags?: string[];
    debug?: boolean;
    new?: boolean;
}

export interface ArtArtist {
    name: string;
    thumbnail: string;
    bio: string;
    link: string;
    mediums: string[];
    flags?: string[];
    new?: boolean;
}

export interface ArtSection {
    name: string;
    thumbnail: string;
    summary: string;
    introduction?: string;
    pieces?: ArtPiece[];
    list?: ArtArtist[];
}

export interface ArtPageData {
    intro: string;
    canvas_art?: ArtSection;
    street_art?: ArtSection;
    digital_art?: ArtSection;
    artists?: ArtSection;
}

// --- Rest of the Detail/Gaming/Tools types preserved ---

export interface Link {
  title: string;
  link: string;
}

export type Tag = string;

export type BehindTheScenes = {
  [key: string]: string | string[] | BehindTheScenes;
};

export interface MusicItemCommonDetails {
    release_date: string;
    links?: Link[];
    tags?: Tag[];
    image_gallery?: string[];
    behind_the_scenes?: BehindTheScenes;
}


export interface SongDetail extends MusicItemCommonDetails {
  title: string;
  artist: string;
  artist_links: { name: string; link: string }[];
  thumbnail: string;
  description: string;
  albums: { name: string; link: string; track: number; cd: number }[];
  genres: string[];
  audio: {
    soundcloud_embed?: string;
    youtube_embed?: string;
  };
  lyrics: {
    [key: string]: string;
  };
}

export interface AlbumDetail extends MusicItemCommonDetails {
  title: string;
  artists: string[];
  description: string;
  banner: string;
}

export interface ArtistDetail extends MusicItemCommonDetails {
  artist: string;
  banner_image: string;
  bio: string;
  songs: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}

export type MusicItemDetail = SongDetail | AlbumDetail | ArtistDetail;

export enum ToolsSideTab {
  Introduction = 'Introduction',
  AllTools = 'All Tools',
  WebTools = 'Web Tools',
  WindowsTools = 'Windows Tools',
  Scripts = 'Scripts',
  Scripts_Py = 'Python Scripts',
  Scripts_PS = 'PowerShell Scripts',
  Scripts_AHK = 'AutoHotkey Scripts',
  AITools = 'AI Tools',
  AI_Apps = 'AI Apps',
  AI_Prompts = 'AI Prompts'
}

export interface Tool {
  name: string;
  thumbnail: string;
  link: string;
  category: string;
  summary: string;
  tags?: string[];
  flags?: string[];
  debug?: boolean;
  new?: boolean;
  dev?: {
      available: boolean;
      finished: boolean;
  };
}

export interface ToolsByCategory {
    web?: Tool[];
    win?: Tool[];
    scripts?: {
        name?: string;
        thumbnail?: string;
        summary?: string;
        py?: Tool[];
        ps?: Tool[];
        ahk?: Tool[];
    };
    ai?: {
        name?: string;
        thumbnail?: string;
        summary?: string;
        apps?: Tool[];
        prompts?: Tool[];
    };
}

export interface ToolsPageData {
  intro: string;
  tools: ToolsByCategory;
}

export interface ToolDetailCommon extends MusicItemCommonDetails {
    name: string;
    banner_image?: string;
    summary: string;
    description: string;
}

export interface WebToolDetail extends ToolDetailCommon {
    category: 'Web Tool';
    source_type: 'git' | 'local';
    app_path: string;
}

export interface WindowsToolDetail extends ToolDetailCommon {
    category: 'Windows Tool';
    downloads: {
        version: string;
        path: string;
        release_notes?: string;
    }[];
}
    
export type ToolDetail = WebToolDetail | WindowsToolDetail;

export enum GamingSideTab {
  Introduction = 'Introduction',
  UE5 = 'UE5 Projects',
  UE5_Games = 'UE5 Games',
  UE5_Assets = 'UE5 Assets',
  UE5_Tools = 'UE5 Tools',
  Unity = 'Unity Projects',
  Unity_Games = 'Unity Games',
  Unity_Assets = 'Unity Assets',
  Unity_Tools = 'Unity Tools',
  GTA = 'GTA Modding',
  GTA_FiveM = 'FiveM',
  GTA_FiveM_Servers = 'FiveM Servers',
  GTA_FiveM_Assets = 'FiveM Assets',
  GTA_FiveM_Tools = 'FiveM Tools',
  GTA_V = 'GTA V (SP)',
  GTA_V_Mods = 'GTA V Mods',
  GTA_V_Scripts = 'GTA V Scripts',
  GTA_IV = 'GTA IV',
  GTA_IV_Mods = 'GTA IV Mods',
  GTA_IV_Scripts = 'GTA IV Scripts',
  Valve = 'Valve / Source',
  Valve_GMod = 'Garry\'s Mod',
  Valve_GMod_Mods = 'GMod Mods',
  Valve_GMod_Maps = 'GMod Maps',
  Valve_Wire = 'Wiremod',
  Valve_Wire_Tools = 'Wire Tools',
  Valve_Wire_Scripts = 'Wire Scripts',
  Roblox = 'Roblox',
  Web = 'Web Games',
  Other = 'Other Projects',
}

export interface Game {
  name: string;
  thumbnail: string;
  link: string;
  genre: string[];
  platform: string[];
  summary: string;
  tags?: string[];
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface Mod {
    name: string;
    game: string;
    thumbnail: string;
    link: string;
    summary: string;
    tags?: string[];
    flags?: string[];
    debug?: boolean;
    new?: boolean;
}

export interface Server {
    name: string;
    game: string;
    thumbnail: string;
    link: string;
    ip_address?: string;
    summary: string;
    tags?: string[];
    flags?: string[];
    debug?: boolean;
    new?: boolean;
}

export interface Asset {
  name: string;
  type: string;
  thumbnail: string;
  link: string;
  summary: string;
  tags?: string[];
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface GamingSection {
  name?: string;
  thumbnail?: string;
  summary?: string;
  introduction?: string;
  games?: Game[];
  mods?: Mod[];
  servers?: Server[];
  assets?: Asset[];
  tools?: any[];
  scripts?: any[];
  fixes?: any[];
  maps?: any[];
}

export interface GtaSection {
  name?: string;
  thumbnail?: string;
  summary?: string;
  introduction?: string | string[];
  fivem?: GamingSection;
  gta5?: GamingSection;
  iv?: GamingSection;
  legacy?: any;
}

export interface ValveSection {
  name?: string;
  thumbnail?: string;
  summary?: string;
  introduction?: string;
  gmod?: GamingSection;
  wire?: GamingSection;
}

export interface GamingPageData {
  intro: string;
  ue5?: GamingSection;
  unity?: GamingSection;
  gta?: GtaSection;
  valve?: ValveSection;
  roblox?: GamingSection;
  web?: GamingSection;
  other?: GamingSection;
}

export enum CommunitySideTab {
  Introduction = 'Introduction',
  People = 'People',
  Events = 'Events',
}

export interface CommunityPerson {
  name: string;
  type: string;
  desc: string;
  thumbnail: string;
  link: string;
  subjects: string[];
  items: any[];
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface CommunityEvent {
  name: string;
  type: string;
  desc: string;
  thumbnail: string;
  link: string;
  location: { type: 'link' | 'address'; loc: string };
  flags?: string[];
  debug?: boolean;
  new?: boolean;
}

export interface CommunityPeople {
  organisers: CommunityPerson[];
  volunteers: CommunityPerson[];
  guests: CommunityPerson[];
}

export interface CommunityPageData {
  introduction: string;
  people: CommunityPeople;
  events: CommunityEvent[];
}

export enum LibrarySideTab {
  Lobby = 'Lobby',
  Aisles = 'Aisles',
  Dictionary = 'Dictionary',
}

export interface LibraryLobby {
  id: string;
  title: string;
  image: string;
  subtitle: string;
  welcome: string;
  what_its_for: string;
  what_it_covers: string;
  document_types: string[];
  adding_documents: string;
}

export interface LibraryPost {
    meta: any;
    cfg?: { title: string; subtitle?: string; [key: string]: any };
    idx?: any;
}

export interface LibraryContentItem {
    name: string;
    path: string;
    type: 'file' | 'dir';
    children?: LibraryContentItem[];
    meta?: LibraryPost;
}

export interface LibraryPageData {
  lobby: LibraryLobby;
  aisles: LibraryContentItem | null;
  dictionary: any | null;
  error?: string;
}

export interface HomePageData {
    welcome: { title: string; subtitle: string; text: string; image: string };
    about: { whatWeDo: { title: string; logos: string[]; services: string[] } };
    featured: { title: string; images: string[] };
    cta: { title: string; text: string; buttons: { text: string; link: string }[] };
}

export interface AboutUsSection {
    id: string;
    title: string;
    main_narrative: string;
    key_points: { point: string; detail: string }[];
    closingStatement: string;
}

export interface TeamMember { name: string; bio: string; images: string[] }

export interface MeetTheTeamSection {
    id: string;
    title: string;
    intro: string;
    team: TeamMember[];
    outro: string;
}

export interface ContactUsSection {
    id: string;
    title: string;
    text: string;
    details: { type: string; value: string }[];
    form: {
        heading: string;
        action_url: string;
        inputs: { name: string; label: string; type: string; required: boolean }[];
    };
}

export interface DynamicFormField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

export interface DynamicFormData {
    form_details: { title: string; subtitle: string; action_url: string };
    inputs: DynamicFormField[];
}

export interface SubmitWorkSection {
    id: string;
    title: string;
    description: string;
    steps: string[];
    link: { url: string };
}

export interface JoinTeamSection {
    id: string;
    title: string;
    text: string;
    openings_link: string;
}

export interface AboutPageData {
    about_us: AboutUsSection;
    meet_the_team: MeetTheTeamSection;
    contact_us: ContactUsSection;
    submit_your_work: SubmitWorkSection;
    join_the_team: JoinTeamSection;
}

export interface DictionaryTerm {
    name: string;
    definition: string;
    example: string;
    level: string;
    difficulty: string;
    category: string;
    sub: string;
}

export interface DictionaryCategory {
    name: string;
    desc: string;
    subs: { name: string; desc: string; example: string }[];
}

export interface DictionarySkillset {
    id: string;
    name: string;
    desc: string;
    levels: { name: string; desc: string }[];
    difficulties: { name: string; desc: string }[];
}

export interface DictionaryData {
    desc?: string[];
    skillsets: DictionarySkillset[];
    collections: {
        id: string;
        name: string;
        desc: string;
        terms?: DictionaryTerm[];
        categories?: DictionaryCategory[];
    }[];
}

export interface MasterDictionary {
    dictionary: DictionaryData;
    errors: string[];
}
