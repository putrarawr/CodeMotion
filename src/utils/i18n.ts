export type Language = 'id' | 'en';

export const translations = {
  id: {
    // Header
    navEditor: 'Editor',
    navTemplates: 'Template',
    navLivePair: 'Live Coding',
    navBuyCoffee: 'Dukung Kami',
    btnCopyImage: 'Salin Gambar',
    btnDownloadPng: 'Unduh PNG',
    btnDownloadSvg: 'Unduh SVG',
    btnRecordVideo: 'Rekam Video',
    btnReset: 'Reset Editor',

    // Landing Page
    landingBadge: 'Multiplayer Real-time Code Editor',
    landingTitle: 'Buat & Bagikan Code Snippet Animasi Presisi Tinggi',
    landingSubtitle: 'Platform visual penulisan kode modern dengan fitur Live Pair Coding WebRTC, animasi mp4, preset sosial media, dan kustomisasi obsidian dark.',
    landingBtnLaunchEditor: 'Buka Editor Kode',
    landingBtnJoinLive: 'Ruang Live Coding',

    // Live Room Page
    lobbyTitle: 'Live Pair Room',
    lobbySubtitle: 'Kolaborasi koding bersama rekan developer secara real-time via P2P WebRTC aman tanpa server.',
    lobbyCreateTitle: 'Buat Ruang Baru',
    lobbyCreateDesc: 'Mulai sesi live coding baru dan bagikan kode akses ke rekan Anda.',
    lobbySelectTemplate: 'Pilih Template Awal:',
    lobbyBtnCreate: 'Buat Ruang Live',
    lobbyJoinTitle: 'Bergabung ke Ruang',
    lobbyJoinDesc: 'Masukkan Kode Ruangan (contoh: cm-a1b2c3) untuk bergabung.',
    lobbyPlaceholderRoom: 'Masukkan Kode Ruangan...',
    lobbyBtnJoin: 'Bergabung Ruangan',
    lobbyYourUsername: 'Nama Pengguna Anda:',

    // Room Header & Controls
    roomHeaderDisband: 'Bubarkan Ruang',
    roomHeaderLeave: 'Keluar Ruang',
    roomHeaderConnected: 'Terhubung',
    roomHeaderShareLink: 'Salin Link Ruang',
    roomHeaderSprintTimer: 'Sprint Timer',
    roomHeaderLiveChat: 'Live Chat',
    roomHeaderThemeStyle: 'Tema & Desain',

    // Modals
    modalCreatedTitle: 'Ruang Live Berhasil Dibuat!',
    modalCreatedDesc: 'Bagikan kode ruangan ini atau salin link langsung agar rekan Anda dapat bergabung:',
    modalCreatedCopyCode: 'Salin Kode Ruangan',
    modalCreatedEnterWorkspace: 'Masuk ke Workspace',

    modalUsernameTitle: 'Masukkan Nama Pengguna',
    modalUsernameDesc: 'Masukkan nama yang akan ditampilkan pada kursor koding dan obrolan live:',
    modalUsernamePlaceholder: 'Nama Anda (misal: putra)...',
    modalUsernameBtn: 'Bergabung Sesi Live',

    modalDisbandTitle: 'Konfirmasi Bubarkan Ruang',
    modalDisbandDesc: 'Apakah Anda yakin ingin membubarkan ruang live ini? Seluruh rekan yang terhubung akan dialihkan dan link ruangan tidak dapat digunakan kembali.',
    modalDisbandConfirm: 'Ya, Bubarkan Ruang',
    modalDisbandCancel: 'Batal',

    modalLeaveTitle: 'Konfirmasi Keluar Ruang',
    modalLeaveDesc: 'Apakah Anda yakin ingin keluar dari sesi live coding ini?',
    modalLeaveConfirm: 'Ya, Keluar Ruang',
    modalLeaveCancel: 'Batal',

    // Toast Messages
    toastCopiedCode: 'Kode Ruangan disalin ke clipboard!',
    toastCopiedLink: 'Link Ruangan disalin ke clipboard!',
  },
  en: {
    // Header
    navEditor: 'Editor',
    navTemplates: 'Templates',
    navLivePair: 'Live Pair',
    navBuyCoffee: 'Support Us',
    btnCopyImage: 'Copy Image',
    btnDownloadPng: 'Download PNG',
    btnDownloadSvg: 'Download SVG',
    btnRecordVideo: 'Record Video',
    btnReset: 'Reset Editor',

    // Landing Page
    landingBadge: 'Real-time Multiplayer Code Editor',
    landingTitle: 'Create & Share Pixel-Perfect Animated Code Snippets',
    landingSubtitle: 'Modern visual code platform with WebRTC Live Pair Coding, mp4 animation recording, social presets, and obsidian dark customization.',
    landingBtnLaunchEditor: 'Open Code Editor',
    landingBtnJoinLive: 'Live Coding Room',

    // Live Room Page
    lobbyTitle: 'Live Pair Room',
    lobbySubtitle: 'Collaborate with fellow developers in real-time via secure zero-server P2P WebRTC.',
    lobbyCreateTitle: 'Create New Room',
    lobbyCreateDesc: 'Start a new live coding session and share the access code with your team.',
    lobbySelectTemplate: 'Select Initial Template:',
    lobbyBtnCreate: 'Launch Live Room',
    lobbyJoinTitle: 'Join Existing Room',
    lobbyJoinDesc: 'Enter Room Code (e.g., cm-a1b2c3) to connect to a workspace.',
    lobbyPlaceholderRoom: 'Enter Room Code...',
    lobbyBtnJoin: 'Join Room',
    lobbyYourUsername: 'Your Display Name:',

    // Room Header & Controls
    roomHeaderDisband: 'Disband Room',
    roomHeaderLeave: 'Leave Room',
    roomHeaderConnected: 'Connected',
    roomHeaderShareLink: 'Share Link',
    roomHeaderSprintTimer: 'Sprint Timer',
    roomHeaderLiveChat: 'Live Chat',
    roomHeaderThemeStyle: 'Theme & Design',

    // Modals
    modalCreatedTitle: 'Live Room Successfully Created!',
    modalCreatedDesc: 'Share this room code or copy the direct link to invite your peers:',
    modalCreatedCopyCode: 'Copy Room Code',
    modalCreatedEnterWorkspace: 'Enter Workspace',

    modalUsernameTitle: 'Enter Your Display Name',
    modalUsernameDesc: 'Enter your name to show on peer cursor badges and live chat:',
    modalUsernamePlaceholder: 'Your Name (e.g. putra)...',
    modalUsernameBtn: 'Join Live Session',

    modalDisbandTitle: 'Confirm Disband Room',
    modalDisbandDesc: 'Are you sure you want to disband this live room? All connected peers will be disconnected and the room link will be invalidated.',
    modalDisbandConfirm: 'Yes, Disband Room',
    modalDisbandCancel: 'Cancel',

    modalLeaveTitle: 'Confirm Leave Room',
    modalLeaveDesc: 'Are you sure you want to leave this live coding session?',
    modalLeaveConfirm: 'Yes, Leave Room',
    modalLeaveCancel: 'Cancel',

    // Toast Messages
    toastCopiedCode: 'Room Code copied to clipboard!',
    toastCopiedLink: 'Share Link copied to clipboard!',
  },
};
