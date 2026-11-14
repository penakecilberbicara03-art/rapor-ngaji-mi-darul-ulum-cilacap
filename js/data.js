/**
 * js/data.js
 * Mengelola kurikulum Al-Qur'an (Juz 30 & 5 Surat Pilihan, 114 Surat),
 * penyimpanan LocalStorage kosong secara default (tanpa data dummy),
 * autentikasi akun (Admin pertama dibuat langsung saat awal penggunaan),
 * serta fungsi CRUD lengkap untuk Kelas, Siswa, Jurnal Harian, dan Pengaturan.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'rapor_roodoh_mi_store_v3';
  var AUTH_KEY = 'rapor_roodoh_mi_auth_v3';

  // Bersihkan cache versi lama agar aplikasi benar-benar kosong dari data contoh sebelumnya
  try {
    localStorage.removeItem('rapor_roodoh_mi_store_v1');
    localStorage.removeItem('rapor_roodoh_mi_store_v2');
    localStorage.removeItem('rapor_roodoh_mi_auth_v2');
  } catch (e) {
    // ignore
  }

  var JUZ_30_SURAHS = [
    { number: 78, name: "An-Naba'", arabicName: 'النبأ', ayatCount: 40, juz: 30 },
    { number: 79, name: "An-Nazi'at", arabicName: 'النازعات', ayatCount: 46, juz: 30 },
    { number: 80, name: "'Abasa", arabicName: 'عبس', ayatCount: 42, juz: 30 },
    { number: 81, name: 'At-Takwir', arabicName: 'التكوير', ayatCount: 29, juz: 30 },
    { number: 82, name: 'Al-Infitar', arabicName: 'الإنفطار', ayatCount: 19, juz: 30 },
    { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', ayatCount: 36, juz: 30 },
    { number: 84, name: 'Al-Insyiqaq', arabicName: 'الإنشقاق', ayatCount: 25, juz: 30 },
    { number: 85, name: 'Al-Buruj', arabicName: 'البروج', ayatCount: 22, juz: 30 },
    { number: 86, name: 'At-Tariq', arabicName: 'الطارق', ayatCount: 17, juz: 30 },
    { number: 87, name: "Al-A'la", arabicName: 'الأعلى', ayatCount: 19, juz: 30 },
    { number: 88, name: 'Al-Ghasyiyah', arabicName: 'الغاشية', ayatCount: 26, juz: 30 },
    { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', ayatCount: 30, juz: 30 },
    { number: 90, name: 'Al-Balad', arabicName: 'البلد', ayatCount: 20, juz: 30 },
    { number: 91, name: 'Asy-Syams', arabicName: 'الشمس', ayatCount: 15, juz: 30 },
    { number: 92, name: 'Al-Lail', arabicName: 'الليل', ayatCount: 21, juz: 30 },
    { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', ayatCount: 11, juz: 30 },
    { number: 94, name: 'Asy-Syarh', arabicName: 'الشرح', ayatCount: 8, juz: 30 },
    { number: 95, name: 'At-Tin', arabicName: 'التين', ayatCount: 8, juz: 30 },
    { number: 96, name: "Al-'Alaq", arabicName: 'العلق', ayatCount: 19, juz: 30 },
    { number: 97, name: 'Al-Qadr', arabicName: 'القدر', ayatCount: 5, juz: 30 },
    { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', ayatCount: 8, juz: 30 },
    { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', ayatCount: 8, juz: 30 },
    { number: 100, name: "Al-'Adiyat", arabicName: 'العاديات', ayatCount: 11, juz: 30 },
    { number: 101, name: "Al-Qari'ah", arabicName: 'القارعة', ayatCount: 11, juz: 30 },
    { number: 102, name: 'At-Takasur', arabicName: 'التكاثر', ayatCount: 8, juz: 30 },
    { number: 103, name: "Al-'Asr", arabicName: 'العصر', ayatCount: 3, juz: 30 },
    { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', ayatCount: 9, juz: 30 },
    { number: 105, name: 'Al-Fil', arabicName: 'الفيل', ayatCount: 5, juz: 30 },
    { number: 106, name: 'Quraisy', arabicName: 'قريش', ayatCount: 4, juz: 30 },
    { number: 107, name: "Al-Ma'un", arabicName: 'الماعون', ayatCount: 7, juz: 30 },
    { number: 108, name: 'Al-Kausar', arabicName: 'الكوثر', ayatCount: 3, juz: 30 },
    { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', ayatCount: 6, juz: 30 },
    { number: 110, name: 'An-Nasr', arabicName: 'النصر', ayatCount: 3, juz: 30 },
    { number: 111, name: 'Al-Lahab', arabicName: 'المسد', ayatCount: 5, juz: 30 },
    { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', ayatCount: 4, juz: 30 },
    { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', ayatCount: 5, juz: 30 },
    { number: 114, name: 'An-Nas', arabicName: 'الناس', ayatCount: 6, juz: 30 },
  ];

  var FIVE_SELECTED_SURAHS = [
    { number: 67, name: 'Al-Mulk', arabicName: 'الملك', ayatCount: 30, juz: 29 },
    { number: 56, name: "Al-Waqi'ah", arabicName: 'الواقعة', ayatCount: 96, juz: 27 },
    { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', ayatCount: 78, juz: 27 },
    { number: 36, name: 'Yasin', arabicName: 'يس', ayatCount: 83, juz: 22 },
    { number: 18, name: 'Al-Kahfi', arabicName: 'الكهف', ayatCount: 110, juz: 15 },
  ];

  var ALL_QURAN_SURAHS = [
    { number: 1, name: 'Al-Fatihah', ayatCount: 7, juz: 1 },
    { number: 2, name: 'Al-Baqarah', ayatCount: 286, juz: 1 },
    { number: 3, name: "Ali 'Imran", ayatCount: 200, juz: 3 },
    { number: 4, name: "An-Nisa'", ayatCount: 176, juz: 4 },
    { number: 5, name: "Al-Ma'idah", ayatCount: 120, juz: 6 },
    { number: 6, name: "Al-An'am", ayatCount: 165, juz: 7 },
    { number: 7, name: "Al-A'raf", ayatCount: 206, juz: 8 },
    { number: 8, name: 'Al-Anfal', ayatCount: 75, juz: 9 },
    { number: 9, name: 'At-Taubah', ayatCount: 129, juz: 10 },
    { number: 10, name: 'Yunus', ayatCount: 109, juz: 11 },
    { number: 11, name: 'Hud', ayatCount: 123, juz: 11 },
    { number: 12, name: 'Yusuf', ayatCount: 111, juz: 12 },
    { number: 13, name: "Ar-Ra'd", ayatCount: 43, juz: 13 },
    { number: 14, name: 'Ibrahim', ayatCount: 52, juz: 13 },
    { number: 15, name: 'Al-Hijr', ayatCount: 99, juz: 14 },
    { number: 16, name: 'An-Nahl', ayatCount: 128, juz: 14 },
    { number: 17, name: "Al-Isra'", ayatCount: 111, juz: 15 },
    { number: 18, name: 'Al-Kahfi', ayatCount: 110, juz: 15 },
    { number: 19, name: 'Maryam', ayatCount: 98, juz: 16 },
    { number: 20, name: 'Taha', ayatCount: 135, juz: 16 },
    { number: 21, name: "Al-Anbiya'", ayatCount: 112, juz: 17 },
    { number: 22, name: 'Al-Hajj', ayatCount: 78, juz: 17 },
    { number: 23, name: "Al-Mu'minun", ayatCount: 118, juz: 18 },
    { number: 24, name: 'An-Nur', ayatCount: 64, juz: 18 },
    { number: 25, name: 'Al-Furqan', ayatCount: 77, juz: 18 },
    { number: 26, name: "Asy-Syu'ara'", ayatCount: 227, juz: 19 },
    { number: 27, name: 'An-Naml', ayatCount: 93, juz: 19 },
    { number: 28, name: 'Al-Qasas', ayatCount: 88, juz: 20 },
    { number: 29, name: "Al-'Ankabut", ayatCount: 69, juz: 20 },
    { number: 30, name: 'Ar-Rum', ayatCount: 60, juz: 21 },
    { number: 31, name: 'Luqman', ayatCount: 34, juz: 21 },
    { number: 32, name: 'As-Sajdah', ayatCount: 30, juz: 21 },
    { number: 33, name: 'Al-Ahzab', ayatCount: 73, juz: 21 },
    { number: 34, name: "Saba'", ayatCount: 54, juz: 22 },
    { number: 35, name: 'Fatir', ayatCount: 45, juz: 22 },
    { number: 36, name: 'Yasin', ayatCount: 83, juz: 22 },
    { number: 37, name: 'As-Saffat', ayatCount: 182, juz: 23 },
    { number: 38, name: 'Sad', ayatCount: 88, juz: 23 },
    { number: 39, name: 'Az-Zumar', ayatCount: 75, juz: 23 },
    { number: 40, name: 'Gafir', ayatCount: 85, juz: 24 },
    { number: 41, name: 'Fussilat', ayatCount: 54, juz: 24 },
    { number: 42, name: 'Asy-Syura', ayatCount: 53, juz: 25 },
    { number: 43, name: 'Az-Zukhruf', ayatCount: 89, juz: 25 },
    { number: 44, name: 'Ad-Dukhan', ayatCount: 59, juz: 25 },
    { number: 45, name: 'Al-Jasiyah', ayatCount: 37, juz: 25 },
    { number: 46, name: 'Al-Ahqaf', ayatCount: 35, juz: 26 },
    { number: 47, name: 'Muhammad', ayatCount: 38, juz: 26 },
    { number: 48, name: 'Al-Fath', ayatCount: 29, juz: 26 },
    { number: 49, name: 'Al-Hujurat', ayatCount: 18, juz: 26 },
    { number: 50, name: 'Qaf', ayatCount: 45, juz: 26 },
    { number: 51, name: 'Az-Zariyat', ayatCount: 60, juz: 26 },
    { number: 52, name: 'At-Tur', ayatCount: 49, juz: 27 },
    { number: 53, name: 'An-Najm', ayatCount: 62, juz: 27 },
    { number: 54, name: 'Al-Qamar', ayatCount: 55, juz: 27 },
    { number: 55, name: 'Ar-Rahman', ayatCount: 78, juz: 27 },
    { number: 56, name: "Al-Waqi'ah", ayatCount: 96, juz: 27 },
    { number: 57, name: 'Al-Hadid', ayatCount: 29, juz: 27 },
    { number: 58, name: 'Al-Mujadalah', ayatCount: 22, juz: 28 },
    { number: 59, name: 'Al-Hasyr', ayatCount: 24, juz: 28 },
    { number: 60, name: 'Al-Mumtahanah', ayatCount: 13, juz: 28 },
    { number: 61, name: 'As-Saff', ayatCount: 14, juz: 28 },
    { number: 62, name: "Al-Jumu'ah", ayatCount: 11, juz: 28 },
    { number: 63, name: 'Al-Munafiqun', ayatCount: 11, juz: 28 },
    { number: 64, name: 'At-Tagabun', ayatCount: 18, juz: 28 },
    { number: 65, name: 'At-Talaq', ayatCount: 12, juz: 28 },
    { number: 66, name: 'At-Tahrim', ayatCount: 12, juz: 28 },
    { number: 67, name: 'Al-Mulk', ayatCount: 30, juz: 29 },
    { number: 68, name: 'Al-Qalam', ayatCount: 52, juz: 29 },
    { number: 69, name: 'Al-Haqqah', ayatCount: 52, juz: 29 },
    { number: 70, name: "Al-Ma'arij", ayatCount: 44, juz: 29 },
    { number: 71, name: 'Nuh', ayatCount: 28, juz: 29 },
    { number: 72, name: 'Al-Jinn', ayatCount: 28, juz: 29 },
    { number: 73, name: 'Al-Muzzammil', ayatCount: 20, juz: 29 },
    { number: 74, name: 'Al-Muddassir', ayatCount: 56, juz: 29 },
    { number: 75, name: 'Al-Qiyamah', ayatCount: 40, juz: 29 },
    { number: 76, name: 'Al-Insan', ayatCount: 31, juz: 29 },
    { number: 77, name: 'Al-Mursalat', ayatCount: 50, juz: 29 },
  ].concat(
    JUZ_30_SURAHS.map(function (s) {
      return { number: s.number, name: s.name, ayatCount: s.ayatCount, juz: 30 };
    })
  );

  var DEFAULT_SETTINGS = {
    namaMadrasah: 'Madrasah Ibtidaiyah Darul Ulum Cilacap',
    alamatMadrasah: '',
    tahunAjaran: '2026/2027',
    semesterAktif: 'Ganjil',
    namaKepalaMadrasah: '',
    nipKepalaMadrasah: '',
    kotaRapor: 'Cilacap',
    tanggalRapor: '',
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Penyimpanan awal 100% kosong (0 kelas, 0 siswa, 0 sesi, 0 akun admin/guru)
   */
  function getEmptyStore() {
    return {
      classes: [],
      students: [],
      sessions: [],
      users: [],
      settings: clone(DEFAULT_SETTINGS),
    };
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var empty = getEmptyStore();
        saveStore(empty);
        return empty;
      }
      var parsed = JSON.parse(raw);
      return {
        classes: Array.isArray(parsed.classes) ? parsed.classes : [],
        students: Array.isArray(parsed.students) ? parsed.students : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        settings: parsed.settings
          ? Object.assign({}, DEFAULT_SETTINGS, parsed.settings)
          : clone(DEFAULT_SETTINGS),
      };
    } catch (err) {
      return getEmptyStore();
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      // Abaikan jika storage quota penuh
    }
  }

  function getSb() {
    return global.RoodohSupabase && global.RoodohSupabase.isConfigured()
      ? global.RoodohSupabase
      : null;
  }

  function syncFromSupabase(onSynced) {
    var sb = getSb();
    if (!sb) return Promise.resolve(false);
    return sb
      .fetchAllStore()
      .then(function (remote) {
        if (!remote) return false;
        var nextStore = {
          classes: Array.isArray(remote.classes) ? remote.classes : [],
          students: Array.isArray(remote.students) ? remote.students : [],
          sessions: Array.isArray(remote.sessions) ? remote.sessions : [],
          users: Array.isArray(remote.users) ? remote.users : [],
          settings: remote.settings
            ? Object.assign({}, DEFAULT_SETTINGS, remote.settings)
            : clone(DEFAULT_SETTINGS),
        };
        saveStore(nextStore);
        if (typeof onSynced === 'function') onSynced(nextStore);
        return true;
      })
      .catch(function (err) {
        console.error('Gagal sinkronisasi dari Supabase:', err);
        return false;
      });
  }

  function restoreBackupStore(nextStore) {
    var normalized = {
      classes: Array.isArray(nextStore.classes) ? nextStore.classes : [],
      students: Array.isArray(nextStore.students) ? nextStore.students : [],
      sessions: Array.isArray(nextStore.sessions) ? nextStore.sessions : [],
      users: Array.isArray(nextStore.users) ? nextStore.users : [],
      settings: nextStore.settings
        ? Object.assign({}, DEFAULT_SETTINGS, nextStore.settings)
        : clone(DEFAULT_SETTINGS),
    };
    saveStore(normalized);
    var sb = getSb();
    if (sb) sb.replaceAllFromBackup(normalized);
    return normalized;
  }

  function clearAllData() {
    var empty = getEmptyStore();
    saveStore(empty);
    setCurrentUser(null);
    var sb = getSb();
    if (sb) sb.clearAllRemote();
    return empty;
  }

  /* ==================== AUTENTIKASI & ROLE AKSES ==================== */

  function getCurrentUser() {
    try {
      var raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (!user) {
        localStorage.removeItem(AUTH_KEY);
      } else {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      }
    } catch (err) {
      // ignore
    }
  }

  /**
   * Registrasi Admin pertama saat aplikasi masih kosong dari akun
   */
  function registerFirstAdmin(nama, username, password, namaMadrasah) {
    var store = loadStore();
    var cleanUser = String(username || '').trim().toLowerCase();
    var cleanPass = String(password || '').trim();
    var cleanNama = String(nama || '').trim();
    if (!cleanNama || !cleanUser || !cleanPass) {
      return { ok: false, error: 'Nama, username, dan kata sandi wajib diisi.' };
    }

    var adminAccount = {
      id: 'usr-' + Date.now(),
      username: cleanUser,
      password: cleanPass,
      role: 'admin',
      nama: cleanNama,
      jabatan: 'Administrator Madrasah',
    };

    store.users.push(adminAccount);
    if (namaMadrasah && String(namaMadrasah).trim()) {
      store.settings.namaMadrasah = String(namaMadrasah).trim();
    }
    saveStore(store);

    var sb = getSb();
    if (sb) {
      sb.upsertUser(adminAccount);
      sb.upsertSettings(store.settings);
    }

    var sessionUser = clone(adminAccount);
    delete sessionUser.password;
    setCurrentUser(sessionUser);
    return { ok: true, user: sessionUser };
  }

  function authenticateUser(usernameInput, passwordInput) {
    var uname = String(usernameInput || '').trim().toLowerCase();
    var pwd = String(passwordInput || '').trim();
    if (!uname || !pwd) {
      return { ok: false, error: 'Username/NISN dan kata sandi wajib diisi.' };
    }

    var store = loadStore();
    var matchedUser = store.users.find(function (u) {
      return u.username.toLowerCase() === uname && u.password === pwd;
    });

    if (matchedUser) {
      var sessionUser = clone(matchedUser);
      delete sessionUser.password;
      setCurrentUser(sessionUser);
      return { ok: true, user: sessionUser };
    }

    // Wali Murid dapat login memakai NISN anak dengan sandi wali123 atau 123456
    var matchedStudent = store.students.find(function (s) {
      return s.nisn.toLowerCase() === uname;
    });
    if (matchedStudent && (pwd === 'wali123' || pwd === '123456')) {
      var waliSession = {
        id: 'usr-wali-' + matchedStudent.id,
        username: matchedStudent.nisn,
        role: 'wali',
        nama: matchedStudent.namaWali,
        jabatan: 'Wali Murid · ' + matchedStudent.nama + ' (' + matchedStudent.kelas + ')',
        studentId: matchedStudent.id,
      };
      setCurrentUser(waliSession);
      return { ok: true, user: waliSession };
    }

    return {
      ok: false,
      error: 'Username/NISN atau kata sandi tidak cocok. Periksa kembali kredensial Anda.',
    };
  }

  function logoutUser() {
    setCurrentUser(null);
  }

  function addUserAccount(userInput) {
    var store = loadStore();
    var newUser = {
      id: 'usr-' + Date.now(),
      username: String(userInput.username || '').trim().toLowerCase(),
      password: String(userInput.password || 'guru123').trim(),
      role: userInput.role || 'guru',
      nama: String(userInput.nama || '').trim(),
      jabatan: String(userInput.jabatan || 'Guru Pembimbing Roodoh').trim(),
      assignedClasses: Array.isArray(userInput.assignedClasses) ? userInput.assignedClasses : [],
    };
    store.users.push(newUser);
    saveStore(store);
    var sb = getSb();
    if (sb) sb.upsertUser(newUser);
    return newUser;
  }

  function deleteUserAccount(userId) {
    var store = loadStore();
    store.users = store.users.filter(function (u) {
      return u.id !== userId;
    });
    saveStore(store);
    var sb = getSb();
    if (sb) sb.deleteUser(userId);
    return store;
  }

  /* ==================== CRUD MANAJEMEN KELAS ==================== */

  function addClass(clsInput) {
    var store = loadStore();
    var newClass = {
      id: 'cls-' + Date.now(),
      nama: String(clsInput.nama || '').trim().toUpperCase(),
      tingkat: Number(clsInput.tingkat) || 1,
      guruPembimbing: String(clsInput.guruPembimbing || '').trim(),
      waliKelas: String(clsInput.waliKelas || '-').trim() || '-',
    };
    store.classes.push(newClass);
    store.classes.sort(function (a, b) {
      if (a.tingkat !== b.tingkat) return a.tingkat - b.tingkat;
      return a.nama.localeCompare(b.nama);
    });
    saveStore(store);
    var sb = getSb();
    if (sb) sb.upsertClass(newClass);
    return newClass;
  }

  function updateClass(id, updates) {
    var store = loadStore();
    var oldClass = store.classes.find(function (c) {
      return c.id === id;
    });
    var oldName = oldClass ? oldClass.nama : null;
    var nextName = updates.nama ? String(updates.nama).trim().toUpperCase() : oldName;

    var updatedCls = null;
    store.classes = store.classes.map(function (c) {
      if (c.id !== id) return c;
      updatedCls = Object.assign({}, c, updates, { nama: nextName });
      return updatedCls;
    });

    if (oldName && nextName && oldName !== nextName) {
      store.students = store.students.map(function (s) {
        return s.kelas === oldName ? Object.assign({}, s, { kelas: nextName }) : s;
      });
    }

    store.classes.sort(function (a, b) {
      if (a.tingkat !== b.tingkat) return a.tingkat - b.tingkat;
      return a.nama.localeCompare(b.nama);
    });
    saveStore(store);

    var sb = getSb();
    if (sb && updatedCls) {
      sb.upsertClass(updatedCls);
      if (oldName && nextName && oldName !== nextName) {
        sb.renameStudentClass(oldName, nextName);
      }
    }
    return store;
  }

  function deleteClass(id) {
    var store = loadStore();
    store.classes = store.classes.filter(function (c) {
      return c.id !== id;
    });
    saveStore(store);
    var sb = getSb();
    if (sb) sb.deleteClass(id);
    return store;
  }

  /* ======================== CRUD DATA SISWA ======================== */

  function addStudent(studentInput) {
    var store = loadStore();
    var newStudent = {
      id: 'stu-' + Date.now(),
      nisn: String(studentInput.nisn || '').trim(),
      nama: String(studentInput.nama || '').trim(),
      kelas: String(studentInput.kelas || '').trim().toUpperCase(),
      jenisKelamin: studentInput.jenisKelamin === 'P' ? 'P' : 'L',
      guruPembimbing: String(studentInput.guruPembimbing || '').trim(),
      namaWali: String(studentInput.namaWali || '-').trim() || '-',
      juz30TuntasBaseline: Boolean(studentInput.juz30TuntasBaseline),
      catatanSemester: {},
      createdAt: new Date().toISOString(),
    };
    store.students.push(newStudent);
    saveStore(store);
    var sb = getSb();
    if (sb) sb.upsertStudent(newStudent);
    return newStudent;
  }

  function updateStudent(id, updates) {
    var store = loadStore();
    var updatedStu = null;
    store.students = store.students.map(function (s) {
      if (s.id !== id) return s;
      updatedStu = Object.assign({}, s, updates);
      return updatedStu;
    });
    saveStore(store);
    var sb = getSb();
    if (sb && updatedStu) sb.upsertStudent(updatedStu);
    return store;
  }

  function deleteStudent(id) {
    var store = loadStore();
    store.students = store.students.filter(function (s) {
      return s.id !== id;
    });
    store.sessions = store.sessions.filter(function (ses) {
      return ses.studentId !== id;
    });
    saveStore(store);
    var sb = getSb();
    if (sb) sb.deleteStudent(id);
    return store;
  }

  /* ==================== CRUD JURNAL HARIAN ==================== */

  function addSession(sessionPayload) {
    var store = loadStore();
    var newSession = Object.assign({}, sessionPayload, {
      id: 'ses-' + Date.now(),
      createdAt: new Date().toISOString(),
    });
    store.sessions.unshift(newSession);
    saveStore(store);
    var sb = getSb();
    if (sb) sb.upsertSession(newSession);
    return newSession;
  }

  function updateSession(id, sessionPayload) {
    var store = loadStore();
    var updatedSes = null;
    store.sessions = store.sessions.map(function (s) {
      if (s.id !== id) return s;
      updatedSes = Object.assign({}, s, sessionPayload);
      return updatedSes;
    });
    saveStore(store);
    var sb = getSb();
    if (sb && updatedSes) sb.upsertSession(updatedSes);
    return store;
  }

  function deleteSession(id) {
    var store = loadStore();
    store.sessions = store.sessions.filter(function (s) {
      return s.id !== id;
    });
    saveStore(store);
    var sb = getSb();
    if (sb) sb.deleteSession(id);
    return store;
  }

  /* ==================== PENGATURAN & CATATAN ==================== */

  function updateSettings(newSettings) {
    var store = loadStore();
    store.settings = Object.assign({}, store.settings, newSettings);
    saveStore(store);
    var sb = getSb();
    if (sb) sb.upsertSettings(store.settings);
    return store;
  }

  function updateStudentSemesterNote(studentId, semesterKey, noteText) {
    var store = loadStore();
    var updatedStu = null;
    store.students = store.students.map(function (s) {
      if (s.id !== studentId) return s;
      var notes = Object.assign({}, s.catatanSemester || {});
      notes[semesterKey] = noteText;
      updatedStu = Object.assign({}, s, { catatanSemester: notes });
      return updatedStu;
    });
    saveStore(store);
    var sb = getSb();
    if (sb && updatedStu) sb.upsertStudent(updatedStu);
    return store;
  }

  /* ==================== UTILITAS TANGGAL SENIN & KAMIS ==================== */

  var HARI_INDONESIA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BULAN_INDONESIA = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  function parseLocalDate(dateStr) {
    var parts = String(dateStr || '').split('-');
    var y = Number(parts[0]) || 2026;
    var m = Number(parts[1]) || 1;
    var d = Number(parts[2]) || 1;
    return new Date(y, m - 1, d);
  }

  function toDateInputString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getDayNameIndo(dateStr) {
    if (!dateStr) return '';
    return HARI_INDONESIA[parseLocalDate(dateStr).getDay()] || '';
  }

  function isMondayOrThursday(dateStr) {
    if (!dateStr) return false;
    var day = parseLocalDate(dateStr).getDay();
    return day === 1 || day === 4;
  }

  function formatTanggalIndo(dateStr, withDay) {
    if (!dateStr) return '-';
    var showDay = withDay !== false;
    var date = parseLocalDate(dateStr);
    var dayName = HARI_INDONESIA[date.getDay()];
    var day = date.getDate();
    var month = BULAN_INDONESIA[date.getMonth()];
    var year = date.getFullYear();
    return showDay ? dayName + ', ' + day + ' ' + month + ' ' + year : day + ' ' + month + ' ' + year;
  }

  function formatTanggalSingkat(dateStr) {
    if (!dateStr) return '-';
    var date = parseLocalDate(dateStr);
    var dayName = HARI_INDONESIA[date.getDay()];
    var day = date.getDate();
    var month = BULAN_INDONESIA[date.getMonth()].slice(0, 3);
    return dayName + ', ' + day + ' ' + month;
  }

  function getNearestScheduleDate(referenceDateStr) {
    var base = referenceDateStr ? parseLocalDate(referenceDateStr) : new Date();
    var day = base.getDay();
    if (day === 1 || day === 4) return toDateInputString(base);
    for (var offset = 1; offset <= 4; offset++) {
      var prev = new Date(base);
      prev.setDate(base.getDate() - offset);
      if (prev.getDay() === 1 || prev.getDay() === 4) {
        return toDateInputString(prev);
      }
    }
    return toDateInputString(base);
  }

  function getRecentScheduleDates(countPast, countFuture, anchorDateStr) {
    var pastTarget = typeof countPast === 'number' ? countPast : 6;
    var futureTarget = typeof countFuture === 'number' ? countFuture : 2;
    var anchor = parseLocalDate(anchorDateStr || toDateInputString(new Date()));
    var past = [];
    var future = [];

    var cursorBack = new Date(anchor);
    while (past.length < pastTarget) {
      if (cursorBack.getDay() === 1 || cursorBack.getDay() === 4) {
        past.push(toDateInputString(cursorBack));
      }
      cursorBack.setDate(cursorBack.getDate() - 1);
    }

    var cursorFwd = new Date(anchor);
    cursorFwd.setDate(anchor.getDate() + 1);
    while (future.length < futureTarget) {
      if (cursorFwd.getDay() === 1 || cursorFwd.getDay() === 4) {
        future.push(toDateInputString(cursorFwd));
      }
      cursorFwd.setDate(cursorFwd.getDate() + 1);
    }

    return future.reverse().concat(past);
  }

  /* ==================== KALKULASI PROGRES OTOMATIS ==================== */

  function sortSessionsDesc(sessions) {
    return sessions.slice().sort(function (a, b) {
      if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }

  function getLastReadingSession(studentId, sessions) {
    var sorted = sortSessionsDesc(sessions);
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].studentId === studentId && sorted[i].bacaan) {
        return sorted[i];
      }
    }
    return null;
  }

  function formatReadingSummary(bacaan) {
    if (!bacaan) return 'Belum ada setoran bacaan';
    if (bacaan.type === 'iqro') {
      return 'Iqro Jilid ' + (bacaan.iqroJilid || 1) + ' · Hal. ' + (bacaan.iqroHalaman || 1);
    }
    var ayatRange = '';
    if (bacaan.ayatDari && bacaan.ayatSampai) {
      ayatRange = 'Ayat ' + bacaan.ayatDari + '–' + bacaan.ayatSampai;
    } else if (bacaan.ayatDari) {
      ayatRange = 'Ayat ' + bacaan.ayatDari;
    }
    return ("Al-Qur'an Juz " + (bacaan.juz || 1) + ' · ' + (bacaan.surahName || '') + ' ' + ayatRange).trim();
  }

  function getStudentTahfidzSummary(student, sessions) {
    var studentSessions = sessions
      .filter(function (s) {
        return s.studentId === student.id && s.hafalan;
      })
      .sort(function (a, b) {
        return a.tanggal.localeCompare(b.tanggal);
      });

    var surahMap = {};
    for (var i = 0; i < studentSessions.length; i++) {
      var ses = studentSessions[i];
      var h = ses.hafalan;
      var prev = surahMap[h.surahNumber];
      var maxAyat = Math.max(prev ? prev.highestAyat : 0, h.ayatSampai);
      var tuntasByFlag = h.statusHafalan === 'Tuntas Surat' || maxAyat >= h.totalAyat;
      surahMap[h.surahNumber] = {
        highestAyat: maxAyat,
        isTuntas: Boolean((prev && prev.isTuntas) || tuntasByFlag),
        predikat: h.predikat,
        lastDate: ses.tanggal,
      };
    }

    var juz30Surahs = JUZ_30_SURAHS.map(function (surah) {
      var rec = surahMap[surah.number];
      if (student.juz30TuntasBaseline) {
        return {
          surah: surah,
          highestAyat: surah.ayatCount,
          isTuntas: true,
          predikat: (rec && rec.predikat) || 'Mumtaz (A)',
          lastDate: rec ? rec.lastDate : undefined,
        };
      }
      return {
        surah: surah,
        highestAyat: rec ? rec.highestAyat : 0,
        isTuntas: rec ? rec.isTuntas : false,
        predikat: rec ? rec.predikat : undefined,
        lastDate: rec ? rec.lastDate : undefined,
      };
    });

    var juz30CompletedCount = juz30Surahs.filter(function (r) {
      return r.isTuntas;
    }).length;
    var isJuz30Complete =
      Boolean(student.juz30TuntasBaseline) || juz30CompletedCount === JUZ_30_SURAHS.length;

    var pilihanSurahs = FIVE_SELECTED_SURAHS.map(function (surah) {
      var rec = surahMap[surah.number];
      return {
        surah: surah,
        highestAyat: rec ? rec.highestAyat : 0,
        isTuntas: rec ? rec.isTuntas : false,
        predikat: rec ? rec.predikat : undefined,
        lastDate: rec ? rec.lastDate : undefined,
      };
    });

    var pilihanCompletedCount = pilihanSurahs.filter(function (r) {
      return r.isTuntas;
    }).length;

    var activeCategory = isJuz30Complete ? 'pilihan' : 'juz30';
    var activeList = activeCategory === 'pilihan' ? pilihanSurahs : juz30Surahs;
    var nextPending = null;
    for (var j = 0; j < activeList.length; j++) {
      if (!activeList[j].isTuntas) {
        nextPending = activeList[j];
        break;
      }
    }
    if (!nextPending) nextPending = activeList[activeList.length - 1];

    var suggestedNextAyatFrom =
      nextPending.highestAyat > 0 && nextPending.highestAyat < nextPending.surah.ayatCount
        ? nextPending.highestAyat + 1
        : 1;

    var lastHafalanSession =
      studentSessions.length > 0 ? studentSessions[studentSessions.length - 1] : null;

    return {
      juz30Surahs: juz30Surahs,
      pilihanSurahs: pilihanSurahs,
      juz30CompletedCount: juz30CompletedCount,
      isJuz30Complete: isJuz30Complete,
      pilihanCompletedCount: pilihanCompletedCount,
      activeCategory: activeCategory,
      suggestedNextSurah: nextPending.surah,
      suggestedNextAyatFrom: suggestedNextAyatFrom,
      lastHafalanSession: lastHafalanSession,
    };
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  global.RoodohData = {
    JUZ_30_SURAHS: JUZ_30_SURAHS,
    FIVE_SELECTED_SURAHS: FIVE_SELECTED_SURAHS,
    ALL_QURAN_SURAHS: ALL_QURAN_SURAHS,
    loadStore: loadStore,
    saveStore: saveStore,
    syncFromSupabase: syncFromSupabase,
    restoreBackupStore: restoreBackupStore,
    clearAllData: clearAllData,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    registerFirstAdmin: registerFirstAdmin,
    authenticateUser: authenticateUser,
    logoutUser: logoutUser,
    addUserAccount: addUserAccount,
    deleteUserAccount: deleteUserAccount,
    addClass: addClass,
    updateClass: updateClass,
    deleteClass: deleteClass,
    addStudent: addStudent,
    updateStudent: updateStudent,
    deleteStudent: deleteStudent,
    addSession: addSession,
    updateSession: updateSession,
    deleteSession: deleteSession,
    updateSettings: updateSettings,
    updateStudentSemesterNote: updateStudentSemesterNote,
    parseLocalDate: parseLocalDate,
    toDateInputString: toDateInputString,
    getDayNameIndo: getDayNameIndo,
    isMondayOrThursday: isMondayOrThursday,
    formatTanggalIndo: formatTanggalIndo,
    formatTanggalSingkat: formatTanggalSingkat,
    getNearestScheduleDate: getNearestScheduleDate,
    getRecentScheduleDates: getRecentScheduleDates,
    sortSessionsDesc: sortSessionsDesc,
    getLastReadingSession: getLastReadingSession,
    formatReadingSummary: formatReadingSummary,
    getStudentTahfidzSummary: getStudentTahfidzSummary,
    escapeHtml: escapeHtml,
  };
})(window);
