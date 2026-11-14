/**
 * js/absensi.js
 * Menangani:
 * 1. Registrasi Admin Pertama (saat aplikasi kosong) & Menu Login (Admin, Guru, Wali Murid).
 * 2. Navigasi antar menu, modal CRUD Kelas/Siswa/Akun, konfirmasi & notifikasi.
 * 3. Dashboard / Rekapitulasi progres harian & semester.
 * 4. Jurnal Ngaji Harian (Senin & Kamis Ba'da Dzuhur, Bacaan & Hafalan fleksibel, posisi terakhir).
 * 5. Manajemen Kelas, Manajemen Siswa (CRUD lengkap), Akun Pengguna, & Pengaturan Madrasah.
 */
(function (global) {
  'use strict';

  var D = global.RoodohData;

  var state = {
    activeTab: 'dashboard',
    selectedStudentId: null,
    editingSessionId: null,
    editingStudentId: null,
    editingClassId: null,
    pendingConfirmFn: null,

    dashPeriodMode: 'semester',
    dashMonth: '2026-11',
    dashClass: 'Semua',
    dashSearch: '',
    dashStuPage: 1,
    dashLogPage: 1,

    stuClass: 'Semua',
    stuSearch: '',
    stuPage: 1,

    journalClassFilter: 'Semua',
    journalStudentId: '',
    journalDate: D.getNearestScheduleDate(D.toDateInputString(new Date())),
    journalAttendance: 'Hadir',
    includeBacaan: true,
    includeHafalan: true,
    readingType: 'iqro',
    iqroJilid: 1,
    iqroHalaman: 1,
    quranJuz: 1,
    quranSurahNum: 1,
    readAyatDari: 1,
    readAyatSampai: 7,
    kelancaran: 'B (Lancar)',
    statusLanjutBaca: 'Lanjut',
    catatanBaca: '',
    hafalanKategori: 'juz30',
    hafalanSurahNum: 78,
    hafalanAyatDari: 1,
    hafalanAyatSampai: 10,
    predikatHafalan: 'Jayyid Jiddan (B+)',
    statusHafalan: 'Lanjut',
    catatanHafalan: '',
  };

  /* ==================== AUTENTIKASI & LOGIN ==================== */

  function checkAuthAndRender() {
    var user = D.getCurrentUser();
    var store = D.loadStore();
    var loginView = document.getElementById('view-login');
    var appHeader = document.getElementById('app-header');
    var appMain = document.getElementById('app-main');

    // Jika belum ada akun sama sekali atau belum login, tampilkan layar masuk / buat akun admin pertama
    if (!user || store.users.length === 0) {
      if (store.users.length === 0 && user) {
        D.logoutUser();
      }
      loginView.classList.remove('hidden');
      appHeader.classList.add('hidden');
      appMain.classList.add('hidden');
      renderLoginView();
      return;
    }

    loginView.classList.add('hidden');
    appHeader.classList.remove('hidden');
    appMain.classList.remove('hidden');

    setupHeaderForUser(user);

    if (user.role === 'guru' && Array.isArray(user.assignedClasses) && user.assignedClasses.length > 0) {
      state.dashClass = user.assignedClasses[0];
      state.stuClass = user.assignedClasses[0];
      state.journalClassFilter = user.assignedClasses[0];
    } else if (user.role === 'wali' && user.studentId) {
      state.selectedStudentId = user.studentId;
    }

    navigateTo('dashboard');
  }

  function renderLoginView() {
    var loginView = document.getElementById('view-login');
    if (!loginView) return;
    var store = D.loadStore();
    var isFirstSetup = store.users.length === 0;

    if (isFirstSetup) {
      loginView.innerHTML =
        '<div class="flex min-h-screen items-center justify-center bg-[#F6F8F7] px-4 py-10">' +
        '<div class="w-full max-w-md rounded-xl border border-[#DCE5E1] bg-white p-6 shadow-xs sm:p-8">' +
        '<div class="flex items-center gap-3 border-b border-[#EDF2F0] pb-5">' +
        '<svg viewBox="0 0 48 48" class="h-11 w-11 shrink-0 text-[#0D7A5F]" fill="none" aria-hidden="true">' +
        '<rect x="10" y="10" width="28" height="28" stroke="currentColor" stroke-width="2" />' +
        '<rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)" stroke="#B78628" stroke-width="1.8" />' +
        '<circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="1.8" /></svg>' +
        '<div>' +
        '<h1 class="text-base font-bold leading-snug tracking-tight text-[#112A22]">RAPOR NGAJI MADRASAH IBTIDAIYAH DARUL ULUM CILACAP</h1>' +
        '<p class="mt-0.5 text-xs text-[#4D645C]">Pengaturan Awal · Belum ada data &amp; akun tersimpan</p>' +
        '</div></div>' +
        '<p class="mt-4 text-xs leading-relaxed text-[#4D645C]">Buat akun <strong>Admin Madrasah</strong> pertama untuk mulai mengelola kelas, siswa, guru pembimbing, dan catatan ngaji.</p>' +
        '<form id="setup-admin-form" class="mt-5 space-y-4">' +
        '<div id="setup-error" class="hidden rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-800"></div>' +
        '<div>' +
        '<label class="block text-xs font-semibold text-[#3C554C]">Nama Madrasah Ibtidaiyah</label>' +
        '<input id="setup-madrasah" type="text" value="Madrasah Ibtidaiyah Darul Ulum Cilacap" placeholder="Madrasah Ibtidaiyah Darul Ulum Cilacap" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm text-[#112A22]" />' +
        '</div>' +
        '<div>' +
        '<label class="block text-xs font-semibold text-[#3C554C]">Nama Lengkap Admin</label>' +
        '<input id="setup-nama" type="text" required placeholder="Nama pengelola / operator MI" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm text-[#112A22]" />' +
        '</div>' +
        '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">' +
        '<div>' +
        '<label class="block text-xs font-semibold text-[#3C554C]">Username Admin</label>' +
        '<input id="setup-username" type="text" required placeholder="Contoh: admin" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm text-[#112A22]" />' +
        '</div>' +
        '<div>' +
        '<label class="block text-xs font-semibold text-[#3C554C]">Kata Sandi</label>' +
        '<input id="setup-password" type="password" required placeholder="Buat kata sandi" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm text-[#112A22]" />' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="min-h-[44px] w-full rounded-lg bg-[#0D7A5F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#09624C]">Buat Akun Admin &amp; Mulai</button>' +
        '</form>' +
        '<div class="mt-5 border-t border-[#EDF2F0] pt-4">' +
        '<label class="flex min-h-[40px] w-full cursor-pointer items-center justify-center rounded-lg border border-[#D4DFDA] bg-[#FAFDFC] px-4 py-2 text-xs font-semibold text-[#2A423A] hover:bg-[#F3F7F5]">Pulihkan dari File Backup (.JSON)<input id="login-restore-json" type="file" accept="application/json" class="hidden" /></label>' +
        '</div></div></div>';

      document.getElementById('setup-admin-form').onsubmit = function (e) {
        e.preventDefault();
        var madrasah = document.getElementById('setup-madrasah').value;
        var nama = document.getElementById('setup-nama').value;
        var uname = document.getElementById('setup-username').value;
        var pwd = document.getElementById('setup-password').value;
        var res = D.registerFirstAdmin(nama, uname, pwd, madrasah);
        if (!res.ok) {
          var errEl = document.getElementById('setup-error');
          errEl.textContent = res.error;
          errEl.classList.remove('hidden');
          return;
        }
        checkAuthAndRender();
      };

      document.getElementById('login-restore-json').onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(String(reader.result));
            if (!Array.isArray(parsed.students) || !Array.isArray(parsed.sessions)) {
              showToast('Format file backup JSON tidak valid.', true);
              return;
            }
            D.saveStore({
              classes: parsed.classes || [],
              students: parsed.students,
              sessions: parsed.sessions,
              users: parsed.users || [],
              settings: parsed.settings || D.loadStore().settings,
            });
            showToast('Data backup berhasil dipulihkan.');
            renderLoginView();
          } catch (err) {
            showToast('Gagal membaca file JSON.', true);
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      };
      return;
    }

    // Standard Login Form ketika Admin sudah terdaftar
    loginView.innerHTML =
      '<div class="flex min-h-screen items-center justify-center bg-[#F6F8F7] px-4 py-10">' +
      '<div class="w-full max-w-md rounded-xl border border-[#DCE5E1] bg-white p-6 shadow-xs sm:p-8">' +
      '<div class="flex items-center gap-3 border-b border-[#EDF2F0] pb-5">' +
      '<svg viewBox="0 0 48 48" class="h-11 w-11 shrink-0 text-[#0D7A5F]" fill="none" aria-hidden="true">' +
      '<rect x="10" y="10" width="28" height="28" stroke="currentColor" stroke-width="2" />' +
      '<rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)" stroke="#B78628" stroke-width="1.8" />' +
      '<circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="1.8" /></svg>' +
      '<div>' +
      '<h1 class="text-base font-bold leading-snug tracking-tight text-[#112A22]">RAPOR NGAJI MADRASAH IBTIDAIYAH DARUL ULUM CILACAP</h1>' +
      '<p class="mt-0.5 text-xs text-[#4D645C]">' +
      D.escapeHtml(store.settings.namaMadrasah || 'Madrasah Ibtidaiyah Darul Ulum Cilacap') +
      '</p></div></div>' +
      '<form id="login-form" class="mt-6 space-y-4">' +
      '<div id="login-error" class="hidden rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-800"></div>' +
      '<div>' +
      '<label class="block text-xs font-semibold text-[#3C554C]">Username (Admin/Guru) atau NISN Anak (Wali Murid)</label>' +
      '<input id="login-username" type="text" required autocomplete="username" placeholder="Masukkan username atau NISN" class="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm text-[#112A22]" />' +
      '</div>' +
      '<div>' +
      '<label class="block text-xs font-semibold text-[#3C554C]">Kata Sandi</label>' +
      '<input id="login-password" type="password" required autocomplete="current-password" placeholder="Masukkan kata sandi" class="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm text-[#112A22]" />' +
      '</div>' +
      '<button type="submit" class="min-h-[44px] w-full rounded-lg bg-[#0D7A5F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#09624C]">Masuk ke Sistem</button>' +
      '</form>' +
      '<p class="mt-4 text-[11px] leading-relaxed text-[#5E756D]">Wali murid dapat masuk menggunakan <strong>NISN anak</strong> dengan sandi default <span class="font-mono font-semibold text-[#112A22]">wali123</span>.</p>' +
      '</div></div>';

    document.getElementById('login-form').onsubmit = function (e) {
      e.preventDefault();
      var u = document.getElementById('login-username').value;
      var p = document.getElementById('login-password').value;
      var res = D.authenticateUser(u, p);
      if (!res.ok) {
        var errBox = document.getElementById('login-error');
        errBox.textContent = res.error;
        errBox.classList.remove('hidden');
        return;
      }
      checkAuthAndRender();
    };
  }

  function setupHeaderForUser(user) {
    var roleLabel =
      user.role === 'admin' ? 'Admin' : user.role === 'guru' ? 'Guru' : 'Wali Murid';
    var userInfoEl = document.getElementById('header-user-info');
    if (userInfoEl) {
      userInfoEl.textContent = user.nama + ' · ' + roleLabel;
    }

    var isWali = user.role === 'wali';
    document.querySelectorAll('[data-nav-tab]').forEach(function (btn) {
      var tab = btn.getAttribute('data-nav-tab');
      if (isWali && (tab === 'journal' || tab === 'students')) {
        btn.classList.add('hidden');
      } else {
        btn.classList.remove('hidden');
      }
      if (tab === 'dashboard') {
        btn.textContent = isWali ? 'Perkembangan Anak' : 'Rekapitulasi';
      }
      if (tab === 'students') {
        btn.textContent = 'Kelas & Siswa';
      }
    });

    var topCta = document.getElementById('top-cta-journal');
    if (topCta) {
      if (isWali) {
        topCta.textContent = 'Lihat Rapor Anak';
        topCta.onclick = function () {
          navigateTo('report', user.studentId);
        };
      } else {
        topCta.textContent = 'Catat Setoran';
        topCta.onclick = function () {
          navigateTo('journal');
        };
      }
    }
  }

  /* ==================== NAVIGASI & MODAL ==================== */

  function navigateTo(tab, studentId) {
    var user = D.getCurrentUser();
    if (!user) return;

    if (user.role === 'wali' && (tab === 'journal' || tab === 'students')) {
      tab = 'dashboard';
    }

    if (studentId) {
      state.selectedStudentId = studentId;
      state.journalStudentId = studentId;
    }
    if (tab !== 'journal') {
      state.editingSessionId = null;
    }
    state.activeTab = tab;
    closeMobileMenu();

    var tabs = ['dashboard', 'journal', 'students', 'report'];
    for (var i = 0; i < tabs.length; i++) {
      var key = tabs[i];
      var panel = document.getElementById('view-' + key);
      if (panel) {
        if (key === tab) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
    }

    var isWali = user.role === 'wali';
    document.querySelectorAll('[data-nav-tab]').forEach(function (btn) {
      var target = btn.getAttribute('data-nav-tab');
      if (isWali && (target === 'journal' || target === 'students')) return;
      var isMobile = btn.getAttribute('data-nav-mobile') === 'true';
      if (isMobile) {
        btn.className =
          'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ' +
          (target === tab
            ? 'bg-[#EFF7F4] font-semibold text-[#0D7A5F]'
            : 'text-[#2A423A] hover:bg-[#F3F7F5]');
      } else {
        btn.className =
          'inline-flex min-h-[40px] items-center gap-1.5 border-b-2 px-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ' +
          (target === tab
            ? 'border-[#0D7A5F] font-semibold text-[#0D7A5F]'
            : 'border-transparent text-[#4D645C] hover:text-[#112A22]');
      }
    });

    renderCurrentTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderCurrentTab() {
    if (state.activeTab === 'dashboard') {
      renderDashboard();
    } else if (state.activeTab === 'journal') {
      if (!state.editingSessionId) {
        hydrateJournalDefaultsForStudent(state.journalStudentId);
      }
      renderJournalView();
    } else if (state.activeTab === 'students') {
      renderStudentsView();
    } else if (state.activeTab === 'report') {
      if (global.RoodohRapor) {
        global.RoodohRapor.renderReport(state.selectedStudentId);
      }
    }
  }

  function closeMobileMenu() {
    var menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.add('hidden');
  }

  function toggleMobileMenu() {
    var menu = document.getElementById('mobile-nav-menu');
    if (menu) menu.classList.toggle('hidden');
  }

  function showToast(message, isError) {
    var toast = document.getElementById('toast-banner');
    if (!toast) return;
    toast.className =
      'no-print fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ' +
      (isError
        ? 'border-rose-200 bg-rose-50 text-rose-900'
        : 'border-emerald-200 bg-emerald-50 text-emerald-950');
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.add('hidden');
    }, 3500);
  }

  function openConfirmModal(title, description, confirmLabel, onConfirm) {
    var modal = document.getElementById('confirm-modal');
    if (!modal) return;
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-desc').textContent = description;
    document.getElementById('confirm-modal-btn').textContent = confirmLabel || 'Ya, Lanjutkan';
    state.pendingConfirmFn = onConfirm;
    modal.classList.remove('hidden');
  }

  function closeConfirmModal() {
    var modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('hidden');
    state.pendingConfirmFn = null;
  }

  /* ==================== DASHBOARD / PORTAL WALI MURID ==================== */

  function formatMonthLabel(ym) {
    var parts = ym.split('-');
    var names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return (names[Number(parts[1]) - 1] || parts[1]) + ' ' + parts[0];
  }

  function renderWaliDashboard(container, store, user) {
    var student = store.students.find(function (s) {
      return s.id === user.studentId;
    });
    if (!student) {
      container.innerHTML =
        '<div class="rounded-xl border border-[#DCE5E1] bg-white p-10 text-center text-sm text-[#4D645C]">Data siswa tidak ditemukan. Hubungi Admin Madrasah.</div>';
      return;
    }

    var stuSessions = D.sortSessionsDesc(
      store.sessions.filter(function (s) {
        return s.studentId === student.id;
      })
    );
    var lastRead = D.getLastReadingSession(student.id, store.sessions);
    var tahfidz = D.getStudentTahfidzSummary(student, store.sessions);
    var hadirCount = stuSessions.filter(function (s) {
      return s.kehadiran === 'Hadir';
    }).length;
    var attPct = stuSessions.length > 0 ? Math.round((hadirCount / stuSessions.length) * 100) : 0;

    var logRows =
      stuSessions.length === 0
        ? '<tr><td colspan="4" class="px-6 py-8 text-center text-sm text-[#5E756D]">Belum ada catatan setoran ngaji.</td></tr>'
        : stuSessions
            .map(function (ses) {
              var attColor =
                ses.kehadiran === 'Hadir'
                  ? 'text-[#0D7A5F]'
                  : ses.kehadiran === 'Alfa'
                    ? 'text-rose-600'
                    : 'text-amber-700';
              return (
                '<tr>' +
                '<td class="px-6 py-3.5"><div class="font-mono text-xs font-semibold text-[#112A22] tabular-nums">' +
                D.escapeHtml(D.formatTanggalIndo(ses.tanggal)) +
                '</div><div class="text-xs text-[#5E756D]">' +
                D.escapeHtml(ses.waktuSesi) +
                '</div></td>' +
                '<td class="px-4 py-3.5 text-xs font-semibold ' +
                attColor +
                '">' +
                D.escapeHtml(ses.kehadiran) +
                '</td>' +
                '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
                (ses.bacaan
                  ? '<div class="font-medium">' +
                    D.escapeHtml(D.formatReadingSummary(ses.bacaan)) +
                    '</div><div class="text-[#5E756D]">' +
                    D.escapeHtml(ses.bacaan.kelancaran) +
                    ' · ' +
                    D.escapeHtml(ses.bacaan.statusLanjut) +
                    '</div>'
                  : '<span class="text-[#869B93]">—</span>') +
                '</td>' +
                '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
                (ses.hafalan
                  ? '<div class="font-medium">' +
                    D.escapeHtml(ses.hafalan.surahName) +
                    ' Ayat ' +
                    ses.hafalan.ayatDari +
                    '–' +
                    ses.hafalan.ayatSampai +
                    '</div><div class="text-[#5E756D]">' +
                    D.escapeHtml(ses.hafalan.predikat) +
                    ' · ' +
                    D.escapeHtml(ses.hafalan.statusHafalan) +
                    '</div>'
                  : '<span class="text-[#869B93]">—</span>') +
                '</td></tr>'
              );
            })
            .join('');

    container.innerHTML =
      '<div class="space-y-8">' +
      '<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">' +
      '<div><h1 class="text-2xl font-bold tracking-tight text-[#112A22]">Perkembangan Ngaji Ananda ' +
      D.escapeHtml(student.nama) +
      '</h1><p class="mt-1 text-sm text-[#4D645C]">Kelas <span class="font-mono font-semibold">' +
      D.escapeHtml(student.kelas) +
      '</span> · NISN <span class="font-mono tabular-nums">' +
      D.escapeHtml(student.nisn) +
      '</span> · Pembimbing: ' +
      D.escapeHtml(student.guruPembimbing) +
      '</p></div>' +
      '<button type="button" id="wali-open-rapor" class="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0D7A5F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#09624C] whitespace-nowrap shrink-0">Buka &amp; Cetak Rapor PDF</button></div>' +
      '<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Posisi Bacaan Terkini</div><div class="mt-2 text-lg font-bold text-[#112A22]">' +
      (lastRead && lastRead.bacaan ? D.escapeHtml(D.formatReadingSummary(lastRead.bacaan)) : 'Belum tercatat') +
      '</div><div class="mt-1 text-xs text-[#0D7A5F]">' +
      (lastRead && lastRead.bacaan ? D.escapeHtml(lastRead.bacaan.kelancaran) : '-') +
      '</div></div>' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Capaian Hafalan (Tahfidz)</div><div class="mt-2 text-lg font-bold text-[#0D7A5F]">' +
      (tahfidz.isJuz30Complete
        ? 'Juz 30 Tuntas · 5 Surat Pilihan (' + tahfidz.pilihanCompletedCount + '/5)'
        : 'Juz 30 (' + tahfidz.juz30CompletedCount + '/37 Surat)') +
      '</div><div class="mt-1 text-xs text-[#4D645C]">Target aktif: ' +
      D.escapeHtml(tahfidz.suggestedNextSurah.name) +
      '</div></div>' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Kehadiran Senin &amp; Kamis</div><div class="mt-2 font-mono text-2xl font-bold text-[#112A22] tabular-nums">' +
      attPct +
      '%</div><div class="mt-1 text-xs text-[#4D645C]">' +
      hadirCount +
      ' hadir dari ' +
      stuSessions.length +
      ' sesi</div></div></div>' +
      '<section class="rounded-xl border border-[#DCE5E1] bg-white">' +
      '<div class="border-b border-[#E7EEEB] px-6 py-4"><h2 class="text-base font-semibold text-[#112A22]">Riwayat Setoran Harian (Senin &amp; Kamis Ba\'da Dzuhur)</h2></div>' +
      '<div class="overflow-x-auto"><table class="w-full min-w-[680px] text-left text-sm">' +
      '<thead><tr class="border-b border-[#E7EEEB] bg-[#FAFDFC] text-xs font-semibold text-[#556D65]">' +
      '<th class="px-6 py-3">Tanggal Sesi</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Setoran Bacaan</th><th class="px-4 py-3">Setoran Hafalan</th>' +
      '</tr></thead><tbody class="divide-y divide-[#EDF2F0]">' +
      logRows +
      '</tbody></table></div></section></div>';

    document.getElementById('wali-open-rapor').onclick = function () {
      navigateTo('report', student.id);
    };
  }

  function renderDashboard() {
    var container = document.getElementById('view-dashboard');
    if (!container) return;

    var store = D.loadStore();
    var currentUser = D.getCurrentUser();
    if (currentUser && currentUser.role === 'wali') {
      renderWaliDashboard(container, store, currentUser);
      return;
    }

    var allSorted = D.sortSessionsDesc(store.sessions);
    var currentYm = D.toDateInputString(new Date()).slice(0, 7);
    var monthSet = {};
    monthSet[currentYm] = true;
    store.sessions.forEach(function (s) {
      monthSet[s.tanggal.slice(0, 7)] = true;
    });
    var availableMonths = Object.keys(monthSet).sort().reverse();
    if (!monthSet[state.dashMonth]) state.dashMonth = availableMonths[0];

    var classes = ['Semua'].concat(
      store.classes.map(function (c) {
        return c.nama;
      })
    );

    var q = state.dashSearch.trim().toLowerCase();
    var filteredStudents = store.students.filter(function (s) {
      var okClass = state.dashClass === 'Semua' || s.kelas === state.dashClass;
      var okSearch =
        !q || s.nama.toLowerCase().indexOf(q) !== -1 || s.nisn.toLowerCase().indexOf(q) !== -1;
      return okClass && okSearch;
    });

    var periodSessions = allSorted.filter(function (ses) {
      if (state.dashPeriodMode === 'bulan') {
        return ses.tanggal.indexOf(state.dashMonth) === 0;
      }
      return (
        ses.semester === store.settings.semesterAktif &&
        ses.tahunAjaran === store.settings.tahunAjaran
      );
    });

    var visibleStuIds = {};
    filteredStudents.forEach(function (s) {
      visibleStuIds[s.id] = true;
    });
    var visibleSessions = periodSessions.filter(function (ses) {
      return Boolean(visibleStuIds[ses.studentId]);
    });

    var scopeStudents =
      state.dashClass === 'Semua'
        ? store.students
        : store.students.filter(function (s) {
            return s.kelas === state.dashClass;
          });
    var alquranCount = 0;
    var iqroCount = 0;
    var pilihanStageCount = 0;
    scopeStudents.forEach(function (stu) {
      var lastRead = D.getLastReadingSession(stu.id, store.sessions);
      if (lastRead && lastRead.bacaan) {
        if (lastRead.bacaan.type === 'alquran') alquranCount++;
        else iqroCount++;
      }
      var tahfidz = D.getStudentTahfidzSummary(stu, store.sessions);
      if (tahfidz.isJuz30Complete) pilihanStageCount++;
    });

    var hadirLogs = visibleSessions.filter(function (s) {
      return s.kehadiran === 'Hadir';
    }).length;
    var attendanceRate =
      visibleSessions.length > 0 ? Math.round((hadirLogs / visibleSessions.length) * 100) : 0;

    var stuPageSize = 15;
    var totalStuPages = Math.max(1, Math.ceil(filteredStudents.length / stuPageSize));
    if (state.dashStuPage > totalStuPages) state.dashStuPage = totalStuPages;
    var pagedStudents = filteredStudents.slice(
      (state.dashStuPage - 1) * stuPageSize,
      state.dashStuPage * stuPageSize
    );

    var logPageSize = 20;
    var totalLogPages = Math.max(1, Math.ceil(visibleSessions.length / logPageSize));
    if (state.dashLogPage > totalLogPages) state.dashLogPage = totalLogPages;
    var pagedSessions = visibleSessions.slice(
      (state.dashLogPage - 1) * logPageSize,
      state.dashLogPage * logPageSize
    );

    var studentRowsHtml = '';
    if (pagedStudents.length === 0) {
      studentRowsHtml =
        '<tr><td colspan="5" class="px-6 py-10 text-center text-sm text-[#5E756D]">' +
        (store.students.length === 0
          ? 'Belum ada data siswa. Mulai dengan membuat kelas dan menambahkan siswa di menu <strong>Kelas &amp; Siswa</strong>.'
          : 'Tidak ada siswa yang sesuai dengan filter pencarian.') +
        '</td></tr>';
    } else {
      studentRowsHtml = pagedStudents
        .map(function (stu) {
          var lastRead = D.getLastReadingSession(stu.id, store.sessions);
          var tahfidz = D.getStudentTahfidzSummary(stu, store.sessions);
          var stuSessions = periodSessions.filter(function (s) {
            return s.studentId === stu.id;
          });
          var stuHadir = stuSessions.filter(function (s) {
            return s.kehadiran === 'Hadir';
          }).length;

          var juz30Pct = Math.round((tahfidz.juz30CompletedCount / 37) * 100);
          var pilihanPct = Math.round((tahfidz.pilihanCompletedCount / 5) * 100);

          var readHtml =
            lastRead && lastRead.bacaan
              ? '<div class="text-xs font-semibold text-[#112A22]">' +
                D.escapeHtml(D.formatReadingSummary(lastRead.bacaan)) +
                '</div><div class="mt-0.5 text-xs text-[#5E756D]">' +
                D.escapeHtml(lastRead.bacaan.kelancaran) +
                ' · ' +
                D.escapeHtml(lastRead.bacaan.statusLanjut) +
                '</div>'
              : '<span class="text-xs text-[#869B93]">Belum ada setoran</span>';

          var tahfidzHtml = '';
          if (tahfidz.isJuz30Complete) {
            var lastAyat =
              tahfidz.lastHafalanSession && tahfidz.lastHafalanSession.hafalan
                ? tahfidz.lastHafalanSession.hafalan.ayatSampai
                : 0;
            tahfidzHtml =
              '<div class="max-w-[230px]">' +
              '<div class="flex items-center justify-between text-xs">' +
              '<span class="font-semibold text-[#0D7A5F]">Juz 30 Tuntas</span>' +
              '<span class="font-mono font-semibold text-[#B78628] tabular-nums">Pilihan ' +
              tahfidz.pilihanCompletedCount +
              '/5</span></div>' +
              '<div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EDF2F0]">' +
              '<div class="h-full bg-[#B78628]" style="width:' +
              Math.max(12, pilihanPct) +
              '%"></div></div>' +
              '<div class="mt-1 text-xs text-[#5E756D]">Aktif: ' +
              D.escapeHtml(tahfidz.suggestedNextSurah.name) +
              ' (Ayat ' +
              lastAyat +
              '/' +
              tahfidz.suggestedNextSurah.ayatCount +
              ')</div></div>';
          } else {
            tahfidzHtml =
              '<div class="max-w-[230px]">' +
              '<div class="flex items-center justify-between text-xs">' +
              '<span class="font-medium text-[#112A22]">Tahap Juz 30</span>' +
              '<span class="font-mono font-semibold text-[#0D7A5F] tabular-nums">' +
              tahfidz.juz30CompletedCount +
              '/37 surat</span></div>' +
              '<div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EDF2F0]">' +
              '<div class="h-full bg-[#0D7A5F]" style="width:' +
              Math.max(4, juz30Pct) +
              '%"></div></div>' +
              '<div class="mt-1 text-xs text-[#5E756D]">Target: ' +
              D.escapeHtml(tahfidz.suggestedNextSurah.name) +
              ' (Ayat ' +
              Math.max(0, tahfidz.suggestedNextAyatFrom - 1) +
              '/' +
              tahfidz.suggestedNextSurah.ayatCount +
              ')</div></div>';
          }

          return (
            '<tr class="transition-colors hover:bg-[#F9FCFB]">' +
            '<td class="px-6 py-4">' +
            '<div class="font-semibold text-[#112A22]">' +
            D.escapeHtml(stu.nama) +
            '</div>' +
            '<div class="mt-0.5 text-xs text-[#5E756D]">Kelas <span class="font-mono">' +
            D.escapeHtml(stu.kelas) +
            '</span> · <span class="font-mono tabular-nums">' +
            D.escapeHtml(stu.nisn) +
            '</span> · ' +
            D.escapeHtml(stu.guruPembimbing) +
            '</div></td>' +
            '<td class="px-4 py-4">' +
            readHtml +
            '</td>' +
            '<td class="px-4 py-4">' +
            tahfidzHtml +
            '</td>' +
            '<td class="px-4 py-4 text-right font-mono text-xs text-[#112A22] tabular-nums">' +
            stuHadir +
            '/' +
            stuSessions.length +
            ' sesi</td>' +
            '<td class="px-6 py-4 text-right">' +
            '<div class="flex items-center justify-end gap-2">' +
            '<button type="button" data-dash-journal="' +
            D.escapeHtml(stu.id) +
            '" class="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0D7A5F] hover:bg-[#EFF7F4] whitespace-nowrap">Setor</button>' +
            '<button type="button" data-dash-report="' +
            D.escapeHtml(stu.id) +
            '" class="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#2A423A] hover:bg-[#F3F7F5] whitespace-nowrap">Rapor</button>' +
            '</div></td></tr>'
          );
        })
        .join('');
    }

    var sessionRowsHtml = '';
    if (pagedSessions.length === 0) {
      sessionRowsHtml =
        '<tr><td colspan="6" class="px-6 py-10 text-center text-sm text-[#5E756D]">Belum ada catatan sesi pada periode yang dipilih.</td></tr>';
    } else {
      var stuMap = {};
      store.students.forEach(function (s) {
        stuMap[s.id] = s;
      });
      sessionRowsHtml = pagedSessions
        .map(function (ses) {
          var stu = stuMap[ses.studentId];
          var attColor =
            ses.kehadiran === 'Hadir'
              ? 'text-[#0D7A5F]'
              : ses.kehadiran === 'Alfa'
                ? 'text-rose-600'
                : 'text-amber-700';

          var bacaCell = ses.bacaan
            ? '<div class="font-medium">' +
              D.escapeHtml(D.formatReadingSummary(ses.bacaan)) +
              '</div><div class="text-[#5E756D]">' +
              D.escapeHtml(ses.bacaan.kelancaran) +
              ' · ' +
              D.escapeHtml(ses.bacaan.statusLanjut) +
              '</div>'
            : '<span class="text-[#869B93]">—</span>';

          var hafalCell = ses.hafalan
            ? '<div class="font-medium">' +
              D.escapeHtml(ses.hafalan.surahName) +
              ' Ayat ' +
              ses.hafalan.ayatDari +
              '–' +
              ses.hafalan.ayatSampai +
              '</div><div class="text-[#5E756D]">' +
              D.escapeHtml(ses.hafalan.predikat) +
              ' · ' +
              D.escapeHtml(ses.hafalan.statusHafalan) +
              '</div>'
            : '<span class="text-[#869B93]">—</span>';

          return (
            '<tr class="transition-colors hover:bg-[#F9FCFB]">' +
            '<td class="px-6 py-3.5"><div class="font-mono text-xs font-semibold text-[#112A22] tabular-nums">' +
            D.escapeHtml(D.formatTanggalSingkat(ses.tanggal)) +
            '</div><div class="text-xs text-[#5E756D]">' +
            D.escapeHtml(ses.waktuSesi) +
            '</div></td>' +
            '<td class="px-4 py-3.5"><div class="font-medium text-[#112A22]">' +
            D.escapeHtml(stu ? stu.nama : 'Siswa') +
            '</div><div class="text-xs text-[#5E756D]">Kelas ' +
            D.escapeHtml(stu ? stu.kelas : '-') +
            '</div></td>' +
            '<td class="px-4 py-3.5 text-xs font-semibold ' +
            attColor +
            '">' +
            D.escapeHtml(ses.kehadiran) +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
            bacaCell +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
            hafalCell +
            '</td>' +
            '<td class="px-6 py-3.5 text-right">' +
            '<div class="flex items-center justify-end gap-1.5">' +
            '<button type="button" data-edit-session="' +
            D.escapeHtml(ses.id) +
            '" class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium text-[#2A423A] hover:bg-[#F3F7F5]">Edit</button>' +
            '<button type="button" data-delete-session="' +
            D.escapeHtml(ses.id) +
            '" class="min-h-[34px] rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>' +
            '</div></td></tr>'
          );
        })
        .join('');
    }

    container.innerHTML =
      '<div class="space-y-8">' +
      '<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">' +
      '<div>' +
      '<h1 class="text-xl font-bold tracking-tight text-[#112A22] sm:text-2xl">RAPOR NGAJI MADRASAH IBTIDAIYAH DARUL ULUM CILACAP</h1>' +
      '<p class="mt-1 text-sm text-[#4D645C]">' +
      D.escapeHtml(store.settings.namaMadrasah || 'Madrasah Ibtidaiyah Darul Ulum Cilacap') +
      ' · ' +
      store.classes.length +
      ' Kelas · Semester ' +
      D.escapeHtml(store.settings.semesterAktif) +
      ' ' +
      D.escapeHtml(store.settings.tahunAjaran) +
      '</p></div>' +
      '<div class="flex flex-wrap gap-2">' +
      (store.students.length === 0
        ? '<button type="button" id="dash-cta-students" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#0D7A5F] bg-white px-4 py-2 text-sm font-semibold text-[#0D7A5F] hover:bg-[#EFF7F4] whitespace-nowrap shrink-0">Kelola Kelas &amp; Siswa</button>'
        : '') +
      '<button type="button" id="dash-cta-journal" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0D7A5F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#09624C] whitespace-nowrap shrink-0">+ Catat Setoran Hari Ini</button>' +
      '</div></div>' +
      // 4 KPI Cards
      '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Siswa ' +
      (state.dashClass === 'Semua' ? 'Seluruh Madrasah' : 'Kelas ' + D.escapeHtml(state.dashClass)) +
      '</div><div class="mt-2 font-mono text-3xl font-bold text-[#112A22] tabular-nums">' +
      scopeStudents.length +
      '</div><div class="mt-1.5 text-xs text-[#4D645C]">Tersebar di ' +
      store.classes.length +
      ' rombongan belajar</div></div>' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Capaian Bacaan Al-Qur\'an</div><div class="mt-2 font-mono text-3xl font-bold text-[#0D7A5F] tabular-nums">' +
      alquranCount +
      '<span class="ml-1.5 text-base font-normal text-[#5E756D]">/ ' +
      scopeStudents.length +
      '</span></div><div class="mt-1.5 text-xs text-[#4D645C]">' +
      iqroCount +
      ' siswa sedang tahap Iqro</div></div>' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Masuk 5 Surat Pilihan</div><div class="mt-2 font-mono text-3xl font-bold text-[#B78628] tabular-nums">' +
      pilihanStageCount +
      '<span class="ml-1.5 text-base font-normal text-[#5E756D]">siswa</span></div><div class="mt-1.5 text-xs text-[#4D645C]">Juz 30 tuntas, lanjut Al-Mulk dst.</div></div>' +
      '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5"><div class="text-xs font-medium text-[#5E756D]">Kehadiran ' +
      (state.dashPeriodMode === 'bulan' ? D.escapeHtml(formatMonthLabel(state.dashMonth)) : 'Semester Ini') +
      '</div><div class="mt-2 font-mono text-3xl font-bold text-[#112A22] tabular-nums">' +
      attendanceRate +
      '%</div><div class="mt-1.5 text-xs text-[#4D645C]">' +
      hadirLogs +
      ' hadir dari ' +
      visibleSessions.length +
      ' catatan sesi</div></div>' +
      '</div>' +
      // Filter Bar
      '<div class="flex flex-col gap-3 rounded-xl border border-[#DCE5E1] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">' +
      '<div class="flex flex-wrap items-center gap-3">' +
      '<div class="flex items-center gap-1 rounded-lg bg-[#F1F5F3] p-1">' +
      '<button type="button" data-dash-period="semester" class="min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ' +
      (state.dashPeriodMode === 'semester'
        ? 'bg-white text-[#112A22] shadow-xs'
        : 'text-[#4D645C] hover:text-[#112A22]') +
      '">1 Semester (' +
      D.escapeHtml(store.settings.semesterAktif) +
      ')</button>' +
      '<button type="button" data-dash-period="bulan" class="min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ' +
      (state.dashPeriodMode === 'bulan'
        ? 'bg-white text-[#112A22] shadow-xs'
        : 'text-[#4D645C] hover:text-[#112A22]') +
      '">Per Bulan</button>' +
      '</div>' +
      (state.dashPeriodMode === 'bulan'
        ? '<select id="dash-month-select" class="min-h-[38px] rounded-lg border border-[#D4DFDA] bg-white px-3 text-xs font-medium text-[#112A22]">' +
          availableMonths
            .map(function (ym) {
              return (
                '<option value="' +
                ym +
                '"' +
                (ym === state.dashMonth ? ' selected' : '') +
                '>' +
                D.escapeHtml(formatMonthLabel(ym)) +
                '</option>'
              );
            })
            .join('') +
          '</select>'
        : '') +
      '<select id="dash-class-select" class="min-h-[38px] rounded-lg border border-[#D4DFDA] bg-white px-3 text-xs font-medium text-[#112A22]">' +
      classes
        .map(function (cls) {
          return (
            '<option value="' +
            D.escapeHtml(cls) +
            '"' +
            (cls === state.dashClass ? ' selected' : '') +
            '>' +
            (cls === 'Semua' ? 'Semua Kelas' : 'Kelas ' + D.escapeHtml(cls)) +
            '</option>'
          );
        })
        .join('') +
      '</select>' +
      '</div>' +
      '<input id="dash-search-input" type="text" value="' +
      D.escapeHtml(state.dashSearch) +
      '" placeholder="Cari nama atau NISN..." class="min-h-[38px] w-full rounded-lg border border-[#D4DFDA] bg-[#FAFDFC] px-3 text-xs text-[#112A22] sm:w-64" />' +
      '</div>' +
      // Table 1
      '<section class="rounded-xl border border-[#DCE5E1] bg-white">' +
      '<div class="flex items-center justify-between border-b border-[#E7EEEB] px-5 py-4 sm:px-6">' +
      '<div><h2 class="text-base font-semibold text-[#112A22]">Capaian Bacaan &amp; Tahfidz Siswa</h2>' +
      '<p class="text-xs text-[#5E756D]">Menampilkan ' +
      pagedStudents.length +
      ' dari ' +
      filteredStudents.length +
      ' siswa (Halaman ' +
      state.dashStuPage +
      '/' +
      totalStuPages +
      ').</p></div>' +
      '<div class="flex items-center gap-1.5">' +
      '<button type="button" id="dash-stu-prev" ' +
      (state.dashStuPage <= 1 ? 'disabled ' : '') +
      'class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium disabled:opacity-40">Prev</button>' +
      '<button type="button" id="dash-stu-next" ' +
      (state.dashStuPage >= totalStuPages ? 'disabled ' : '') +
      'class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium disabled:opacity-40">Next</button>' +
      '</div></div>' +
      '<div class="overflow-x-auto"><table class="w-full min-w-[820px] text-left text-sm">' +
      '<thead><tr class="border-b border-[#E7EEEB] bg-[#FAFDFC] text-xs font-semibold text-[#556D65]">' +
      '<th class="px-6 py-3.5">Nama Siswa &amp; Kelas</th>' +
      '<th class="px-4 py-3.5">Bacaan Terkini</th>' +
      '<th class="px-4 py-3.5">Progres Hafalan (Tahfidz)</th>' +
      '<th class="px-4 py-3.5 text-right">Kehadiran Periode</th>' +
      '<th class="px-6 py-3.5 text-right">Aksi</th></tr></thead>' +
      '<tbody class="divide-y divide-[#EDF2F0]">' +
      studentRowsHtml +
      '</tbody></table></div></section>' +
      // Table 2
      '<section class="rounded-xl border border-[#DCE5E1] bg-white">' +
      '<div class="flex items-center justify-between border-b border-[#E7EEEB] px-5 py-4 sm:px-6">' +
      '<div><h2 class="text-base font-semibold text-[#112A22]">Rekam Jejak Setoran Harian (Senin &amp; Kamis Ba\'da Dzuhur)</h2>' +
      '<p class="text-xs text-[#5E756D]">Menampilkan ' +
      pagedSessions.length +
      ' dari ' +
      visibleSessions.length +
      ' catatan (Halaman ' +
      state.dashLogPage +
      '/' +
      totalLogPages +
      ').</p></div>' +
      '<div class="flex items-center gap-1.5">' +
      '<button type="button" id="dash-log-prev" ' +
      (state.dashLogPage <= 1 ? 'disabled ' : '') +
      'class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium disabled:opacity-40">Prev</button>' +
      '<button type="button" id="dash-log-next" ' +
      (state.dashLogPage >= totalLogPages ? 'disabled ' : '') +
      'class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium disabled:opacity-40">Next</button>' +
      '</div></div>' +
      '<div class="overflow-x-auto"><table class="w-full min-w-[820px] text-left text-sm">' +
      '<thead><tr class="border-b border-[#E7EEEB] bg-[#FAFDFC] text-xs font-semibold text-[#556D65]">' +
      '<th class="px-6 py-3">Tanggal Sesi</th><th class="px-4 py-3">Siswa</th><th class="px-4 py-3">Status</th>' +
      '<th class="px-4 py-3">Setoran Bacaan</th><th class="px-4 py-3">Setoran Hafalan</th>' +
      '<th class="px-6 py-3 text-right">Aksi</th></tr></thead>' +
      '<tbody class="divide-y divide-[#EDF2F0]">' +
      sessionRowsHtml +
      '</tbody></table></div></section>' +
      '</div>';

    var ctaStu = document.getElementById('dash-cta-students');
    if (ctaStu) {
      ctaStu.onclick = function () {
        navigateTo('students');
      };
    }
    document.getElementById('dash-cta-journal').onclick = function () {
      navigateTo('journal');
    };
    container.querySelectorAll('[data-dash-period]').forEach(function (btn) {
      btn.onclick = function () {
        state.dashPeriodMode = btn.getAttribute('data-dash-period');
        state.dashLogPage = 1;
        renderDashboard();
      };
    });
    var monthSel = document.getElementById('dash-month-select');
    if (monthSel) {
      monthSel.onchange = function () {
        state.dashMonth = monthSel.value;
        state.dashLogPage = 1;
        renderDashboard();
      };
    }
    document.getElementById('dash-class-select').onchange = function (e) {
      state.dashClass = e.target.value;
      state.dashStuPage = 1;
      state.dashLogPage = 1;
      renderDashboard();
    };
    document.getElementById('dash-search-input').oninput = function (e) {
      state.dashSearch = e.target.value;
      state.dashStuPage = 1;
      state.dashLogPage = 1;
      renderDashboard();
      var inp = document.getElementById('dash-search-input');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    };

    document.getElementById('dash-stu-prev').onclick = function () {
      if (state.dashStuPage > 1) {
        state.dashStuPage--;
        renderDashboard();
      }
    };
    document.getElementById('dash-stu-next').onclick = function () {
      if (state.dashStuPage < totalStuPages) {
        state.dashStuPage++;
        renderDashboard();
      }
    };
    document.getElementById('dash-log-prev').onclick = function () {
      if (state.dashLogPage > 1) {
        state.dashLogPage--;
        renderDashboard();
      }
    };
    document.getElementById('dash-log-next').onclick = function () {
      if (state.dashLogPage < totalLogPages) {
        state.dashLogPage++;
        renderDashboard();
      }
    };

    container.querySelectorAll('[data-dash-journal]').forEach(function (btn) {
      btn.onclick = function () {
        navigateTo('journal', btn.getAttribute('data-dash-journal'));
      };
    });
    container.querySelectorAll('[data-dash-report]').forEach(function (btn) {
      btn.onclick = function () {
        navigateTo('report', btn.getAttribute('data-dash-report'));
      };
    });
    bindSessionRowActions(container);
  }

  function bindSessionRowActions(rootEl) {
    rootEl.querySelectorAll('[data-edit-session]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-edit-session');
        var found = D.loadStore().sessions.find(function (s) {
          return s.id === id;
        });
        if (found) startEditSession(found);
      };
    });

    rootEl.querySelectorAll('[data-delete-session]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-delete-session');
        openConfirmModal(
          'Hapus Catatan Setoran?',
          'Catatan setoran ngaji pada sesi ini akan dihapus permanen dari riwayat siswa.',
          'Hapus Catatan',
          function () {
            D.deleteSession(id);
            if (state.editingSessionId === id) state.editingSessionId = null;
            closeConfirmModal();
            showToast('Catatan setoran berhasil dihapus.');
            renderCurrentTab();
          }
        );
      };
    });
  }

  /* ==================== JURNAL NGAJI HARIAN (SENIN & KAMIS) ==================== */

  function hydrateJournalDefaultsForStudent(stuId) {
    var store = D.loadStore();
    var student =
      store.students.find(function (s) {
        return s.id === stuId;
      }) ||
      store.students.find(function (s) {
        return s.kelas === state.journalClassFilter;
      }) ||
      store.students[0];
    if (!student) return;

    state.journalClassFilter = student.kelas;
    state.journalStudentId = student.id;
    state.journalAttendance = 'Hadir';
    state.includeBacaan = true;
    state.includeHafalan = true;

    var lastRead = D.getLastReadingSession(student.id, store.sessions);
    if (lastRead && lastRead.bacaan) {
      var b = lastRead.bacaan;
      state.readingType = b.type;
      if (b.type === 'iqro') {
        state.iqroJilid = b.iqroJilid || 1;
        state.iqroHalaman = b.statusLanjut === 'Mengulang' ? b.iqroHalaman || 1 : (b.iqroHalaman || 0) + 1;
      } else {
        var qSurah =
          D.ALL_QURAN_SURAHS.find(function (s) {
            return s.number === b.surahNumber;
          }) || D.ALL_QURAN_SURAHS[0];
        state.quranJuz = b.juz || qSurah.juz;
        state.quranSurahNum = qSurah.number;
        var nextFrom =
          b.statusLanjut === 'Mengulang'
            ? b.ayatDari || 1
            : Math.min((b.ayatSampai || 0) + 1, qSurah.ayatCount);
        var nextTo =
          b.statusLanjut === 'Mengulang'
            ? b.ayatSampai || Math.min(nextFrom + 10, qSurah.ayatCount)
            : Math.min(nextFrom + 14, qSurah.ayatCount);
        state.readAyatDari = nextFrom;
        state.readAyatSampai = nextTo;
      }
    } else {
      state.readingType = 'iqro';
      state.iqroJilid = 1;
      state.iqroHalaman = 1;
    }
    state.statusLanjutBaca = 'Lanjut';
    state.catatanBaca = '';

    var tahfidz = D.getStudentTahfidzSummary(student, store.sessions);
    state.hafalanKategori = tahfidz.activeCategory;
    state.hafalanSurahNum = tahfidz.suggestedNextSurah.number;
    state.hafalanAyatDari = tahfidz.suggestedNextAyatFrom;
    state.hafalanAyatSampai = Math.min(
      tahfidz.suggestedNextAyatFrom + 4,
      tahfidz.suggestedNextSurah.ayatCount
    );
    state.statusHafalan =
      state.hafalanAyatSampai >= tahfidz.suggestedNextSurah.ayatCount ? 'Tuntas Surat' : 'Lanjut';
    state.catatanHafalan = '';
  }

  function startEditSession(session) {
    var store = D.loadStore();
    var stu = store.students.find(function (s) {
      return s.id === session.studentId;
    });
    if (stu) state.journalClassFilter = stu.kelas;
    state.editingSessionId = session.id;
    state.journalStudentId = session.studentId;
    state.journalDate = session.tanggal;
    state.journalAttendance = session.kehadiran;
    state.includeBacaan = Boolean(session.bacaan);
    state.includeHafalan = Boolean(session.hafalan);

    if (session.bacaan) {
      var b = session.bacaan;
      state.readingType = b.type;
      state.iqroJilid = b.iqroJilid || 1;
      state.iqroHalaman = b.iqroHalaman || 1;
      state.quranJuz = b.juz || 1;
      state.quranSurahNum = b.surahNumber || 1;
      state.readAyatDari = b.ayatDari || 1;
      state.readAyatSampai = b.ayatSampai || 7;
      state.kelancaran = b.kelancaran;
      state.statusLanjutBaca = b.statusLanjut;
      state.catatanBaca = b.catatan || '';
    }

    if (session.hafalan) {
      var h = session.hafalan;
      state.hafalanKategori = h.kategori;
      state.hafalanSurahNum = h.surahNumber;
      state.hafalanAyatDari = h.ayatDari;
      state.hafalanAyatSampai = h.ayatSampai;
      state.predikatHafalan = h.predikat;
      state.statusHafalan = h.statusHafalan;
      state.catatanHafalan = h.catatan || '';
    }

    navigateTo('journal', session.studentId);
  }

  function renderJournalView() {
    var container = document.getElementById('view-journal');
    if (!container) return;

    var store = D.loadStore();
    if (store.students.length === 0) {
      container.innerHTML =
        '<div class="rounded-xl border border-[#DCE5E1] bg-white p-10 text-center">' +
        '<h2 class="text-lg font-semibold text-[#112A22]">Belum Ada Data Siswa</h2>' +
        '<p class="mt-1 text-sm text-[#4D645C]">Tambahkan kelas dan siswa terlebih dahulu di menu <strong>Kelas &amp; Siswa</strong> sebelum mengisi jurnal ngaji.</p>' +
        '<button type="button" id="jrn-goto-students" class="mt-4 min-h-[40px] rounded-lg bg-[#0D7A5F] px-4 py-2 text-sm font-semibold text-white">Buka Kelas &amp; Siswa</button></div>';
      document.getElementById('jrn-goto-students').onclick = function () {
        navigateTo('students');
      };
      return;
    }

    var studentsInClass =
      state.journalClassFilter === 'Semua'
        ? store.students
        : store.students.filter(function (s) {
            return s.kelas === state.journalClassFilter;
          });
    if (studentsInClass.length === 0) {
      studentsInClass = store.students;
      state.journalClassFilter = 'Semua';
    }

    var student =
      studentsInClass.find(function (s) {
        return s.id === state.journalStudentId;
      }) || studentsInClass[0];
    state.journalStudentId = student.id;

    var todayStr = D.toDateInputString(new Date());
    var quickDates = D.getRecentScheduleDates(6, 2, todayStr);
    var isScheduleValid = D.isMondayOrThursday(state.journalDate);
    var dayName = D.getDayNameIndo(state.journalDate);

    var lastRead = D.getLastReadingSession(student.id, store.sessions);
    var tahfidz = D.getStudentTahfidzSummary(student, store.sessions);

    var activeHafalanList =
      state.hafalanKategori === 'pilihan' ? D.FIVE_SELECTED_SURAHS : D.JUZ_30_SURAHS;
    var selectedHafalanSurah =
      activeHafalanList.find(function (s) {
        return s.number === state.hafalanSurahNum;
      }) || activeHafalanList[0];
    state.hafalanSurahNum = selectedHafalanSurah.number;

    var selectedQuranSurah =
      D.ALL_QURAN_SURAHS.find(function (s) {
        return s.number === state.quranSurahNum;
      }) || D.ALL_QURAN_SURAHS[0];

    var sessionsOnDate = store.sessions.filter(function (s) {
      if (s.tanggal !== state.journalDate) return false;
      if (state.journalClassFilter === 'Semua') return true;
      var stu = store.students.find(function (st) {
        return st.id === s.studentId;
      });
      return stu && stu.kelas === state.journalClassFilter;
    });

    var lastReadSummaryHtml =
      lastRead && lastRead.bacaan
        ? '<div class="mt-1"><div class="text-sm font-semibold text-[#112A22]">' +
          D.escapeHtml(D.formatReadingSummary(lastRead.bacaan)) +
          '</div><div class="mt-0.5 text-xs text-[#4D645C]">' +
          D.escapeHtml(lastRead.bacaan.kelancaran) +
          ' · ' +
          D.escapeHtml(lastRead.bacaan.statusLanjut) +
          ' · ' +
          D.escapeHtml(D.formatTanggalSingkat(lastRead.tanggal)) +
          '</div></div>'
        : '<div class="mt-1 text-sm text-[#5E756D]">Belum ada riwayat setoran bacaan.</div>';

    var lastHafalanSummaryHtml =
      tahfidz.lastHafalanSession && tahfidz.lastHafalanSession.hafalan
        ? '<div class="mt-1"><div class="text-sm font-semibold text-[#112A22]">' +
          D.escapeHtml(tahfidz.lastHafalanSession.hafalan.surahName) +
          ' Ayat ' +
          tahfidz.lastHafalanSession.hafalan.ayatDari +
          '–' +
          tahfidz.lastHafalanSession.hafalan.ayatSampai +
          ' <span class="font-normal text-[#5E756D]">(dari ' +
          tahfidz.lastHafalanSession.hafalan.totalAyat +
          ' ayat)</span></div><div class="mt-0.5 text-xs text-[#4D645C]">' +
          D.escapeHtml(tahfidz.lastHafalanSession.hafalan.predikat) +
          ' · ' +
          D.escapeHtml(tahfidz.lastHafalanSession.hafalan.statusHafalan) +
          ' · ' +
          D.escapeHtml(D.formatTanggalSingkat(tahfidz.lastHafalanSession.tanggal)) +
          '</div></div>'
        : '<div class="mt-1 text-sm text-[#5E756D]">' +
          (tahfidz.isJuz30Complete
            ? 'Juz 30 tuntas · Siap mulai Surat Pilihan #1 (Al-Mulk)'
            : "Belum ada setoran · Mulai dari An-Naba' ayat 1") +
          '</div>';

    var bacaanFieldsHtml = '';
    if (state.readingType === 'iqro') {
      bacaanFieldsHtml =
        '<div class="grid grid-cols-2 gap-4">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Jilid Iqro</label>' +
        '<select id="jrn-iqro-jilid" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 font-mono text-sm text-[#112A22]">' +
        [1, 2, 3, 4, 5, 6]
          .map(function (j) {
            return (
              '<option value="' +
              j +
              '"' +
              (j === state.iqroJilid ? ' selected' : '') +
              '>Iqro Jilid ' +
              j +
              '</option>'
            );
          })
          .join('') +
        '</select></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Halaman</label>' +
        '<input id="jrn-iqro-hal" type="number" min="1" max="60" value="' +
        state.iqroHalaman +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm text-[#112A22] tabular-nums" /></div></div>';
    } else {
      bacaanFieldsHtml =
        '<div class="space-y-4"><div class="grid grid-cols-1 gap-4 sm:grid-cols-3">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Juz</label>' +
        '<select id="jrn-quran-juz" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 font-mono text-sm text-[#112A22]">' +
        Array.from({ length: 30 }, function (_, i) {
          return i + 1;
        })
          .map(function (j) {
            return (
              '<option value="' +
              j +
              '"' +
              (j === state.quranJuz ? ' selected' : '') +
              '>Juz ' +
              j +
              '</option>'
            );
          })
          .join('') +
        '</select></div>' +
        '<div class="sm:col-span-2"><label class="block text-xs font-semibold text-[#3C554C]">Nama Surat</label>' +
        '<select id="jrn-quran-surah" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm text-[#112A22]">' +
        D.ALL_QURAN_SURAHS.map(function (s) {
          return (
            '<option value="' +
            s.number +
            '"' +
            (s.number === state.quranSurahNum ? ' selected' : '') +
            '>' +
            s.number +
            '. ' +
            D.escapeHtml(s.name) +
            ' (' +
            s.ayatCount +
            ' ayat)</option>'
          );
        }).join('') +
        '</select></div></div>' +
        '<div class="grid grid-cols-2 gap-4">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Dari Ayat</label>' +
        '<input id="jrn-read-from" type="number" min="1" max="' +
        selectedQuranSurah.ayatCount +
        '" value="' +
        state.readAyatDari +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm text-[#112A22] tabular-nums" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Sampai Ayat (maks. ' +
        selectedQuranSurah.ayatCount +
        ')</label>' +
        '<input id="jrn-read-to" type="number" min="1" max="' +
        selectedQuranSurah.ayatCount +
        '" value="' +
        state.readAyatSampai +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm text-[#112A22] tabular-nums" /></div>' +
        '</div></div>';
    }

    var bacaanPanelHtml = '';
    if (state.journalAttendance === 'Hadir' && state.includeBacaan) {
      bacaanPanelHtml =
        '<section class="rounded-xl border border-[#DCE5E1] bg-white p-5 sm:p-6">' +
        '<div class="flex items-center justify-between border-b border-[#EDF2F0] pb-4">' +
        '<div><h2 class="text-base font-semibold text-[#112A22]">1. Progres Bacaan</h2>' +
        '<p class="text-xs text-[#5E756D]">Iqro Jilid 1–6 atau Al-Qur\'an</p></div>' +
        '<div class="flex items-center gap-1 rounded-lg bg-[#F1F5F3] p-1">' +
        '<button type="button" data-read-type="iqro" class="min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold ' +
        (state.readingType === 'iqro' ? 'bg-white text-[#112A22] shadow-xs' : 'text-[#4D645C]') +
        '">Iqro</button>' +
        '<button type="button" data-read-type="alquran" class="min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold ' +
        (state.readingType === 'alquran' ? 'bg-white text-[#112A22] shadow-xs' : 'text-[#4D645C]') +
        '">Al-Qur\'an</button></div></div>' +
        '<div class="mt-5 space-y-4">' +
        bacaanFieldsHtml +
        '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Nilai Kelancaran &amp; Tajwid</label>' +
        '<select id="jrn-kelancaran" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm text-[#112A22]">' +
        ['A (Sangat Lancar)', 'B (Lancar)', 'C (Cukup)', 'D (Perlu Bimbingan)']
          .map(function (opt) {
            return (
              '<option value="' +
              D.escapeHtml(opt) +
              '"' +
              (opt === state.kelancaran ? ' selected' : '') +
              '>' +
              D.escapeHtml(opt) +
              '</option>'
            );
          })
          .join('') +
        '</select></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Keputusan Sesi</label>' +
        '<div class="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-[#F1F5F3] p-1">' +
        ['Lanjut', 'Mengulang']
          .map(function (st) {
            var activeCls =
              state.statusLanjutBaca === st
                ? st === 'Lanjut'
                  ? 'bg-[#0D7A5F] text-white'
                  : 'bg-amber-600 text-white'
                : 'text-[#4D645C]';
            return (
              '<button type="button" data-read-status="' +
              st +
              '" class="min-h-[34px] rounded-md px-2 text-xs font-semibold ' +
              activeCls +
              '">' +
              st +
              '</button>'
            );
          })
          .join('') +
        '</div></div></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Catatan Guru (Tajwid / Makhraj)</label>' +
        '<textarea id="jrn-catatan-baca" rows="2" placeholder="Contoh: Bacaan mad dan ghunnah sudah tepat." class="mt-1.5 w-full rounded-lg border border-[#D4DFDA] p-3 text-sm text-[#112A22]">' +
        D.escapeHtml(state.catatanBaca) +
        '</textarea></div></div></section>';
    }

    var hafalanPanelHtml = '';
    if (state.journalAttendance === 'Hadir' && state.includeHafalan) {
      var surahProgressList =
        state.hafalanKategori === 'pilihan' ? tahfidz.pilihanSurahs : tahfidz.juz30Surahs;

      hafalanPanelHtml =
        '<section class="rounded-xl border border-[#DCE5E1] bg-white p-5 sm:p-6">' +
        '<div class="flex flex-col gap-3 border-b border-[#EDF2F0] pb-4 sm:flex-row sm:items-center sm:justify-between">' +
        '<div><h2 class="text-base font-semibold text-[#112A22]">2. Progres Hafalan (Tahfidz)</h2>' +
        '<p class="text-xs text-[#5E756D]">Wajib tuntas Juz 30 terlebih dahulu sebelum 5 Surat Pilihan</p></div>' +
        '<div class="flex items-center gap-1 rounded-lg bg-[#F1F5F3] p-1">' +
        '<button type="button" data-hafalan-cat="juz30" class="min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ' +
        (state.hafalanKategori === 'juz30' ? 'bg-white text-[#112A22] shadow-xs' : 'text-[#4D645C]') +
        '">Juz 30</button>' +
        '<button type="button" data-hafalan-cat="pilihan" ' +
        (!tahfidz.isJuz30Complete ? 'disabled title="Selesaikan Juz 30 terlebih dahulu" ' : '') +
        'class="min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ' +
        (state.hafalanKategori === 'pilihan'
          ? 'bg-white text-[#B78628] shadow-xs'
          : !tahfidz.isJuz30Complete
            ? 'cursor-not-allowed text-[#94A8A0]'
            : 'text-[#4D645C]') +
        '">' +
        (!tahfidz.isJuz30Complete ? 'Terkunci: ' : '') +
        '5 Surat Pilihan</button></div></div>' +
        (!tahfidz.isJuz30Complete
          ? '<div class="mt-4 rounded-lg border border-[#E4ECE8] bg-[#FAFDFC] px-3.5 py-2.5 text-xs text-[#3C554C]">Alur Tahfidz: <strong class="text-[#112A22]">Tahap 1 — Juz 30</strong> (<span class="font-mono tabular-nums">' +
            tahfidz.juz30CompletedCount +
            "/37</span> surat tuntas). 5 Surat Pilihan (Al-Mulk s.d. Al-Kahfi) terbuka otomatis setelah An-Naba' s.d. An-Nas tuntas.</div>"
          : '') +
        '<div class="mt-4 space-y-4">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">' +
        (state.hafalanKategori === 'pilihan'
          ? 'Pilih Surat Pilihan Utama'
          : "Pilih Surat Juz 30 (Urutan An-Naba' s.d. An-Nas)") +
        '</label>' +
        '<select id="jrn-hafalan-surah" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm text-[#112A22]">' +
        activeHafalanList
          .map(function (s, idx) {
            var prog = surahProgressList.find(function (r) {
              return r.surah.number === s.number;
            });
            var stTxt =
              prog && prog.isTuntas
                ? ' — Tuntas'
                : prog && prog.highestAyat > 0
                  ? ' — Sampai ayat ' + prog.highestAyat + '/' + s.ayatCount
                  : '';
            return (
              '<option value="' +
              s.number +
              '"' +
              (s.number === selectedHafalanSurah.number ? ' selected' : '') +
              '>' +
              (idx + 1) +
              '. ' +
              D.escapeHtml(s.name) +
              ' (' +
              s.ayatCount +
              ' ayat)' +
              D.escapeHtml(stTxt) +
              '</option>'
            );
          })
          .join('') +
        '</select></div>' +
        '<div class="grid grid-cols-2 gap-4">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Ayat Mulai</label>' +
        '<input id="jrn-hafalan-from" type="number" min="1" max="' +
        selectedHafalanSurah.ayatCount +
        '" value="' +
        state.hafalanAyatDari +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm text-[#112A22] tabular-nums" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Ayat Akhir (maks. ' +
        selectedHafalanSurah.ayatCount +
        ')</label>' +
        '<input id="jrn-hafalan-to" type="number" min="1" max="' +
        selectedHafalanSurah.ayatCount +
        '" value="' +
        state.hafalanAyatSampai +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm text-[#112A22] tabular-nums" /></div>' +
        '</div>' +
        '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Predikat Nilai Hafalan</label>' +
        '<select id="jrn-hafalan-predikat" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm text-[#112A22]">' +
        ['Mumtaz (A)', 'Jayyid Jiddan (B+)', 'Jayyid (B)', 'Maqbul (C)']
          .map(function (g) {
            return (
              '<option value="' +
              D.escapeHtml(g) +
              '"' +
              (g === state.predikatHafalan ? ' selected' : '') +
              '>' +
              D.escapeHtml(g) +
              '</option>'
            );
          })
          .join('') +
        '</select></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Status Hafalan</label>' +
        '<select id="jrn-hafalan-status" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm text-[#112A22]">' +
        [
          { val: 'Lanjut', lbl: 'Lanjut (Sebagian Surat)' },
          { val: 'Tuntas Surat', lbl: 'Tuntas Surat' },
          { val: 'Murajaah', lbl: "Muraja'ah / Mengulang" },
        ]
          .map(function (opt) {
            return (
              '<option value="' +
              opt.val +
              '"' +
              (opt.val === state.statusHafalan ? ' selected' : '') +
              '>' +
              D.escapeHtml(opt.lbl) +
              '</option>'
            );
          })
          .join('') +
        '</select></div></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Catatan Hafalan</label>' +
        '<textarea id="jrn-catatan-hafalan" rows="2" placeholder="Contoh: Hafalan kuat, lancar tanpa bantuan." class="mt-1.5 w-full rounded-lg border border-[#D4DFDA] p-3 text-sm text-[#112A22]">' +
        D.escapeHtml(state.catatanHafalan) +
        '</textarea></div></div></section>';
    }

    var dateLogsHtml = '';
    if (sessionsOnDate.length === 0) {
      dateLogsHtml =
        '<tr><td colspan="5" class="px-6 py-8 text-center text-sm text-[#5E756D]">Belum ada setoran yang dicatat pada kelas &amp; tanggal ini.</td></tr>';
    } else {
      var sMap = {};
      store.students.forEach(function (s) {
        sMap[s.id] = s;
      });
      dateLogsHtml = sessionsOnDate
        .map(function (ses) {
          var stu = sMap[ses.studentId];
          var attColor =
            ses.kehadiran === 'Hadir'
              ? 'text-[#0D7A5F]'
              : ses.kehadiran === 'Alfa'
                ? 'text-rose-600'
                : 'text-amber-700';
          return (
            '<tr class="hover:bg-[#F9FCFB]">' +
            '<td class="px-6 py-3.5"><div class="font-semibold text-[#112A22]">' +
            D.escapeHtml(stu ? stu.nama : 'Siswa') +
            '</div><div class="text-xs text-[#5E756D]">Kelas ' +
            D.escapeHtml(stu ? stu.kelas : '-') +
            '</div></td>' +
            '<td class="px-4 py-3.5 text-xs font-semibold ' +
            attColor +
            '">' +
            D.escapeHtml(ses.kehadiran) +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
            (ses.bacaan
              ? '<div class="font-medium">' +
                D.escapeHtml(D.formatReadingSummary(ses.bacaan)) +
                '</div><div class="text-[#5E756D]">' +
                D.escapeHtml(ses.bacaan.kelancaran) +
                ' · ' +
                D.escapeHtml(ses.bacaan.statusLanjut) +
                '</div>'
              : '<span class="text-[#869B93]">— Tidak setor bacaan</span>') +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
            (ses.hafalan
              ? '<div class="font-medium">' +
                D.escapeHtml(ses.hafalan.surahName) +
                ' Ayat ' +
                ses.hafalan.ayatDari +
                '–' +
                ses.hafalan.ayatSampai +
                '</div><div class="text-[#5E756D]">' +
                D.escapeHtml(ses.hafalan.predikat) +
                ' · ' +
                D.escapeHtml(ses.hafalan.statusHafalan) +
                '</div>'
              : '<span class="text-[#869B93]">— Tidak setor hafalan</span>') +
            '</td>' +
            '<td class="px-6 py-3.5 text-right"><div class="flex items-center justify-end gap-1.5">' +
            '<button type="button" data-edit-session="' +
            D.escapeHtml(ses.id) +
            '" class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium text-[#2A423A] hover:bg-[#F3F7F5]">Edit</button>' +
            '<button type="button" data-delete-session="' +
            D.escapeHtml(ses.id) +
            '" class="min-h-[34px] rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>' +
            '</div></td></tr>'
          );
        })
        .join('');
    }

    container.innerHTML =
      '<div class="space-y-6">' +
      '<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">' +
      '<div><h1 class="text-2xl font-bold tracking-tight text-[#112A22]">' +
      (state.editingSessionId
        ? 'Edit Catatan Setoran Ngaji'
        : 'Jurnal Ngaji Harian (Senin &amp; Kamis)') +
      '</h1><p class="mt-1 text-sm text-[#4D645C]">Sesi rutin Ba\'da Sholat Dzuhur · Siswa dapat menyetorkan bacaan, hafalan, atau keduanya sekaligus.</p></div>' +
      (state.editingSessionId
        ? '<button type="button" id="jrn-cancel-edit" class="min-h-[40px] rounded-lg border border-[#D4DFDA] bg-white px-4 py-2 text-sm font-medium text-[#2A423A] hover:bg-[#F3F7F5]">Batal Edit</button>'
        : '') +
      '</div>' +
      '<form id="journal-form" class="space-y-6">' +
      '<section class="rounded-xl border border-[#DCE5E1] bg-white p-5 sm:p-6">' +
      '<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">' +
      '<div class="lg:col-span-5">' +
      '<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">' +
      '<div><label class="block text-xs font-semibold text-[#3C554C]">Kelas</label>' +
      '<select id="jrn-class-select" ' +
      (state.editingSessionId ? 'disabled ' : '') +
      'class="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D4DFDA] bg-white px-2.5 text-sm font-medium text-[#112A22] disabled:bg-[#F4F7F6]">' +
      '<option value="Semua"' +
      (state.journalClassFilter === 'Semua' ? ' selected' : '') +
      '>Semua</option>' +
      store.classes
        .map(function (c) {
          return (
            '<option value="' +
            D.escapeHtml(c.nama) +
            '"' +
            (state.journalClassFilter === c.nama ? ' selected' : '') +
            '>' +
            D.escapeHtml(c.nama) +
            '</option>'
          );
        })
        .join('') +
      '</select></div>' +
      '<div class="sm:col-span-2"><label class="block text-xs font-semibold text-[#3C554C]">Pilih Siswa (' +
      studentsInClass.length +
      ')</label>' +
      '<select id="jrn-student-select" ' +
      (state.editingSessionId ? 'disabled ' : '') +
      'class="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm font-medium text-[#112A22] disabled:bg-[#F4F7F6]">' +
      studentsInClass
        .map(function (s) {
          return (
            '<option value="' +
            D.escapeHtml(s.id) +
            '"' +
            (s.id === student.id ? ' selected' : '') +
            '>' +
            D.escapeHtml(s.nama) +
            ' (' +
            D.escapeHtml(s.kelas) +
            ')</option>'
          );
        })
        .join('') +
      '</select></div></div>' +
      '<p class="mt-1.5 text-xs text-[#5E756D]">NISN <span class="font-mono">' +
      D.escapeHtml(student.nisn) +
      '</span> · Pembimbing: <span class="font-medium text-[#2A423A]">' +
      D.escapeHtml(student.guruPembimbing) +
      '</span></p></div>' +
      '<div class="lg:col-span-4"><label class="block text-xs font-semibold text-[#3C554C]">Tanggal Sesi (Senin &amp; Kamis Ba\'da Dzuhur)</label>' +
      '<div class="mt-1.5 flex items-center gap-2">' +
      '<input id="jrn-date-input" type="date" value="' +
      D.escapeHtml(state.journalDate) +
      '" class="min-h-[44px] flex-1 rounded-lg border border-[#D4DFDA] bg-white px-3 font-mono text-sm text-[#112A22]" />' +
      '<span class="inline-flex min-h-[44px] items-center rounded-lg border px-3 text-xs font-semibold whitespace-nowrap ' +
      (isScheduleValid
        ? 'border-emerald-200 bg-emerald-50 text-[#0D7A5F]'
        : 'border-amber-200 bg-amber-50 text-amber-800') +
      '">' +
      D.escapeHtml(dayName) +
      '</span></div>' +
      '<div class="mt-2 flex flex-wrap gap-1.5">' +
      quickDates
        .slice(0, 5)
        .map(function (d) {
          return (
            '<button type="button" data-quick-date="' +
            d +
            '" class="rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ' +
            (d === state.journalDate
              ? 'bg-[#0D7A5F] text-white'
              : 'bg-[#F1F5F3] text-[#3C554C] hover:bg-[#E2EBE7]') +
            '">' +
            D.escapeHtml(D.formatTanggalSingkat(d)) +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      (!isScheduleValid
        ? '<div class="mt-2 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"><span>Hari ' +
          D.escapeHtml(dayName) +
          ' di luar jadwal rutin Senin &amp; Kamis.</span><button type="button" id="jrn-snap-date" class="font-semibold text-[#0D7A5F] underline whitespace-nowrap">Pilih Senin/Kamis</button></div>'
        : '') +
      '</div>' +
      '<div class="lg:col-span-3"><label class="block text-xs font-semibold text-[#3C554C]">Kehadiran Ba\'da Dzuhur</label>' +
      '<div class="mt-1.5 grid grid-cols-2 gap-1.5 rounded-lg bg-[#F1F5F3] p-1">' +
      ['Hadir', 'Izin', 'Sakit', 'Alfa']
        .map(function (st) {
          var cls =
            state.journalAttendance === st
              ? st === 'Hadir'
                ? 'bg-[#0D7A5F] text-white shadow-xs'
                : 'bg-white text-[#112A22] shadow-xs'
              : 'text-[#4D645C]';
          return (
            '<button type="button" data-att-status="' +
            st +
            '" class="min-h-[38px] rounded-md px-2 py-1 text-xs font-semibold ' +
            cls +
            '">' +
            st +
            '</button>'
          );
        })
        .join('') +
      '</div></div></div>' +
      '<div class="mt-6 border-t border-[#E7EEEB] pt-5">' +
      '<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">' +
      '<span class="text-xs font-semibold text-[#0D7A5F]">Riwayat Otomatis · Posisi Terakhir ' +
      D.escapeHtml(student.nama) +
      '</span>' +
      '<span class="text-xs text-[#5E756D]">' +
      (tahfidz.isJuz30Complete
        ? 'Juz 30 Tuntas (37/37) · 5 Surat Pilihan: ' + tahfidz.pilihanCompletedCount + '/5 tuntas'
        : 'Tahap Hafalan: Juz 30 (' + tahfidz.juz30CompletedCount + '/37 surat tuntas)') +
      '</span></div>' +
      '<div class="mt-3 grid grid-cols-1 gap-4 rounded-lg border border-[#E4ECE8] bg-[#FAFDFC] p-4 md:grid-cols-2">' +
      '<div><div class="text-xs font-medium text-[#5E756D]">Bacaan Terakhir</div>' +
      lastReadSummaryHtml +
      '</div>' +
      '<div class="border-t border-[#E7EEEB] pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0"><div class="text-xs font-medium text-[#5E756D]">Hafalan (Tahfidz) Terakhir</div>' +
      lastHafalanSummaryHtml +
      '</div></div></div></section>' +
      (state.journalAttendance === 'Hadir'
        ? '<div class="flex flex-col gap-3 rounded-xl border border-[#DCE5E1] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">' +
          '<div><div class="text-sm font-semibold text-[#112A22]">Pilihan Setoran Sesi Ini</div><p class="text-xs text-[#5E756D]">Pilih satu jenis setoran atau aktifkan keduanya sekaligus.</p></div>' +
          '<div class="flex flex-wrap items-center gap-2">' +
          '<button type="button" id="jrn-toggle-bacaan" class="inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold ' +
          (state.includeBacaan
            ? 'border-[#0D7A5F] bg-[#EFF7F4] text-[#0D7A5F]'
            : 'border-[#D4DFDA] bg-white text-[#5E756D]') +
          '">' +
          (state.includeBacaan ? '✓ ' : '') +
          "1. Setoran Bacaan (Iqro / Al-Qur'an)</button>" +
          '<button type="button" id="jrn-toggle-hafalan" class="inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold ' +
          (state.includeHafalan
            ? 'border-[#0D7A5F] bg-[#EFF7F4] text-[#0D7A5F]'
            : 'border-[#D4DFDA] bg-white text-[#5E756D]') +
          '">' +
          (state.includeHafalan ? '✓ ' : '') +
          '2. Setoran Hafalan (Tahfidz)</button>' +
          '</div></div>' +
          '<div class="grid grid-cols-1 gap-6 ' +
          (state.includeBacaan && state.includeHafalan ? 'lg:grid-cols-2' : '') +
          '">' +
          bacaanPanelHtml +
          hafalanPanelHtml +
          '</div>'
        : '<div class="rounded-xl border border-[#DCE5E1] bg-white p-5 text-sm text-[#4D645C]">Siswa tercatat <strong class="text-[#112A22]">' +
          D.escapeHtml(state.journalAttendance) +
          '</strong> pada sesi ' +
          D.escapeHtml(D.formatTanggalIndo(state.journalDate)) +
          '. Klik simpan untuk merekam kehadiran.</div>') +
      '<div id="jrn-error-box" class="hidden rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800"></div>' +
      '<div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">' +
      '<p class="text-xs text-[#5E756D]">Sesi tercatat untuk <span class="font-semibold text-[#112A22]">' +
      D.escapeHtml(D.formatTanggalIndo(state.journalDate)) +
      "</span> · Ba'da Dzuhur</p>" +
      '<button type="submit" class="min-h-[44px] w-full rounded-lg bg-[#0D7A5F] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#09624C] sm:w-auto">' +
      (state.editingSessionId ? 'Simpan Perubahan Setoran' : 'Simpan Jurnal Ngaji') +
      '</button></div></form>' +
      '<section class="rounded-xl border border-[#DCE5E1] bg-white">' +
      '<div class="flex items-center justify-between border-b border-[#E7EEEB] px-5 py-4 sm:px-6">' +
      '<div><h2 class="text-base font-semibold text-[#112A22]">Rekap Sesi Tanggal ' +
      D.escapeHtml(D.formatTanggalIndo(state.journalDate, false)) +
      (state.journalClassFilter !== 'Semua' ? ' · Kelas ' + D.escapeHtml(state.journalClassFilter) : '') +
      '</h2><p class="text-xs text-[#5E756D]">Daftar siswa yang sudah diinput pada hari ' +
      D.escapeHtml(dayName) +
      " ba'da Dzuhur.</p></div>" +
      '<span class="font-mono text-xs font-semibold text-[#0D7A5F] tabular-nums">' +
      sessionsOnDate.length +
      ' catatan</span></div>' +
      '<div class="overflow-x-auto"><table class="w-full min-w-[700px] text-left text-sm">' +
      '<thead><tr class="border-b border-[#E7EEEB] bg-[#FAFDFC] text-xs font-semibold text-[#556D65]">' +
      '<th class="px-6 py-3">Siswa</th><th class="px-4 py-3">Kehadiran</th><th class="px-4 py-3">Setoran Bacaan</th>' +
      '<th class="px-4 py-3">Setoran Hafalan</th><th class="px-6 py-3 text-right">Aksi</th></tr></thead>' +
      '<tbody class="divide-y divide-[#EDF2F0]">' +
      dateLogsHtml +
      '</tbody></table></div></section></div>';

    bindJournalFormEvents(container, tahfidz);
    bindSessionRowActions(container);
  }

  function syncJournalDomInputsToState() {
    var el;
    if ((el = document.getElementById('jrn-iqro-jilid'))) state.iqroJilid = Number(el.value);
    if ((el = document.getElementById('jrn-iqro-hal'))) state.iqroHalaman = Math.max(1, Number(el.value));
    if ((el = document.getElementById('jrn-quran-juz'))) state.quranJuz = Number(el.value);
    if ((el = document.getElementById('jrn-quran-surah'))) state.quranSurahNum = Number(el.value);
    if ((el = document.getElementById('jrn-read-from'))) state.readAyatDari = Math.max(1, Number(el.value));
    if ((el = document.getElementById('jrn-read-to'))) state.readAyatSampai = Math.max(1, Number(el.value));
    if ((el = document.getElementById('jrn-kelancaran'))) state.kelancaran = el.value;
    if ((el = document.getElementById('jrn-catatan-baca'))) state.catatanBaca = el.value;
    if ((el = document.getElementById('jrn-hafalan-surah'))) state.hafalanSurahNum = Number(el.value);
    if ((el = document.getElementById('jrn-hafalan-from'))) state.hafalanAyatDari = Math.max(1, Number(el.value));
    if ((el = document.getElementById('jrn-hafalan-to'))) state.hafalanAyatSampai = Math.max(1, Number(el.value));
    if ((el = document.getElementById('jrn-hafalan-predikat'))) state.predikatHafalan = el.value;
    if ((el = document.getElementById('jrn-hafalan-status'))) state.statusHafalan = el.value;
    if ((el = document.getElementById('jrn-catatan-hafalan'))) state.catatanHafalan = el.value;
  }

  function bindJournalFormEvents(container, tahfidz) {
    var cancelBtn = document.getElementById('jrn-cancel-edit');
    if (cancelBtn) {
      cancelBtn.onclick = function () {
        state.editingSessionId = null;
        hydrateJournalDefaultsForStudent(state.journalStudentId);
        renderJournalView();
      };
    }

    document.getElementById('jrn-class-select').onchange = function (e) {
      state.journalClassFilter = e.target.value;
      var store = D.loadStore();
      var firstInClass =
        state.journalClassFilter === 'Semua'
          ? store.students[0]
          : store.students.find(function (s) {
              return s.kelas === state.journalClassFilter;
            });
      if (firstInClass) {
        hydrateJournalDefaultsForStudent(firstInClass.id);
      }
      renderJournalView();
    };

    document.getElementById('jrn-student-select').onchange = function (e) {
      state.journalStudentId = e.target.value;
      state.selectedStudentId = e.target.value;
      hydrateJournalDefaultsForStudent(e.target.value);
      renderJournalView();
    };

    document.getElementById('jrn-date-input').onchange = function (e) {
      syncJournalDomInputsToState();
      state.journalDate = e.target.value;
      renderJournalView();
    };

    container.querySelectorAll('[data-quick-date]').forEach(function (btn) {
      btn.onclick = function () {
        syncJournalDomInputsToState();
        state.journalDate = btn.getAttribute('data-quick-date');
        renderJournalView();
      };
    });

    var snapBtn = document.getElementById('jrn-snap-date');
    if (snapBtn) {
      snapBtn.onclick = function () {
        syncJournalDomInputsToState();
        state.journalDate = D.getNearestScheduleDate(state.journalDate);
        renderJournalView();
      };
    }

    container.querySelectorAll('[data-att-status]').forEach(function (btn) {
      btn.onclick = function () {
        syncJournalDomInputsToState();
        state.journalAttendance = btn.getAttribute('data-att-status');
        renderJournalView();
      };
    });

    var togBaca = document.getElementById('jrn-toggle-bacaan');
    if (togBaca) {
      togBaca.onclick = function () {
        syncJournalDomInputsToState();
        state.includeBacaan = !state.includeBacaan;
        renderJournalView();
      };
    }

    var togHafal = document.getElementById('jrn-toggle-hafalan');
    if (togHafal) {
      togHafal.onclick = function () {
        syncJournalDomInputsToState();
        state.includeHafalan = !state.includeHafalan;
        renderJournalView();
      };
    }

    container.querySelectorAll('[data-read-type]').forEach(function (btn) {
      btn.onclick = function () {
        syncJournalDomInputsToState();
        state.readingType = btn.getAttribute('data-read-type');
        renderJournalView();
      };
    });

    container.querySelectorAll('[data-read-status]').forEach(function (btn) {
      btn.onclick = function () {
        syncJournalDomInputsToState();
        state.statusLanjutBaca = btn.getAttribute('data-read-status');
        renderJournalView();
      };
    });

    var qSurahSel = document.getElementById('jrn-quran-surah');
    if (qSurahSel) {
      qSurahSel.onchange = function () {
        syncJournalDomInputsToState();
        var num = Number(qSurahSel.value);
        var found = D.ALL_QURAN_SURAHS.find(function (s) {
          return s.number === num;
        });
        if (found) {
          state.quranJuz = found.juz;
          state.readAyatDari = 1;
          state.readAyatSampai = Math.min(15, found.ayatCount);
        }
        renderJournalView();
      };
    }

    container.querySelectorAll('[data-hafalan-cat]').forEach(function (btn) {
      btn.onclick = function () {
        syncJournalDomInputsToState();
        var cat = btn.getAttribute('data-hafalan-cat');
        state.hafalanKategori = cat;
        var list = cat === 'pilihan' ? D.FIVE_SELECTED_SURAHS : D.JUZ_30_SURAHS;
        state.hafalanSurahNum = list[0].number;
        state.hafalanAyatDari = 1;
        state.hafalanAyatSampai = Math.min(5, list[0].ayatCount);
        state.statusHafalan = 'Lanjut';
        renderJournalView();
      };
    });

    var hSurahSel = document.getElementById('jrn-hafalan-surah');
    if (hSurahSel) {
      hSurahSel.onchange = function () {
        syncJournalDomInputsToState();
        var num = Number(hSurahSel.value);
        var list = state.hafalanKategori === 'pilihan' ? D.FIVE_SELECTED_SURAHS : D.JUZ_30_SURAHS;
        var surah =
          list.find(function (s) {
            return s.number === num;
          }) || list[0];
        var progList = state.hafalanKategori === 'pilihan' ? tahfidz.pilihanSurahs : tahfidz.juz30Surahs;
        var prog = progList.find(function (r) {
          return r.surah.number === num;
        });
        var startAyat =
          prog && prog.highestAyat > 0 && prog.highestAyat < surah.ayatCount
            ? prog.highestAyat + 1
            : 1;
        var endAyat = Math.min(startAyat + 4, surah.ayatCount);
        state.hafalanSurahNum = surah.number;
        state.hafalanAyatDari = startAyat;
        state.hafalanAyatSampai = endAyat;
        state.statusHafalan = endAyat >= surah.ayatCount ? 'Tuntas Surat' : 'Lanjut';
        renderJournalView();
      };
    }

    document.getElementById('journal-form').onsubmit = function (e) {
      e.preventDefault();
      syncJournalDomInputsToState();

      var errBox = document.getElementById('jrn-error-box');
      if (state.journalAttendance === 'Hadir' && !state.includeBacaan && !state.includeHafalan) {
        errBox.textContent =
          'Untuk siswa yang hadir, aktifkan minimal satu jenis setoran (Bacaan atau Hafalan).';
        errBox.classList.remove('hidden');
        return;
      }
      errBox.classList.add('hidden');

      var store = D.loadStore();
      var bacaanEntry = undefined;
      if (state.journalAttendance === 'Hadir' && state.includeBacaan) {
        if (state.readingType === 'iqro') {
          bacaanEntry = {
            type: 'iqro',
            iqroJilid: state.iqroJilid,
            iqroHalaman: Math.max(1, state.iqroHalaman),
            kelancaran: state.kelancaran,
            statusLanjut: state.statusLanjutBaca,
            catatan: state.catatanBaca.trim() || undefined,
          };
        } else {
          var qSurah =
            D.ALL_QURAN_SURAHS.find(function (s) {
              return s.number === state.quranSurahNum;
            }) || D.ALL_QURAN_SURAHS[0];
          bacaanEntry = {
            type: 'alquran',
            juz: state.quranJuz,
            surahNumber: qSurah.number,
            surahName: qSurah.name,
            ayatDari: Math.max(1, state.readAyatDari),
            ayatSampai: Math.min(
              qSurah.ayatCount,
              Math.max(state.readAyatDari, state.readAyatSampai)
            ),
            kelancaran: state.kelancaran,
            statusLanjut: state.statusLanjutBaca,
            catatan: state.catatanBaca.trim() || undefined,
          };
        }
      }

      var hafalanEntry = undefined;
      if (state.journalAttendance === 'Hadir' && state.includeHafalan) {
        var hList = state.hafalanKategori === 'pilihan' ? D.FIVE_SELECTED_SURAHS : D.JUZ_30_SURAHS;
        var hSurah =
          hList.find(function (s) {
            return s.number === state.hafalanSurahNum;
          }) || hList[0];
        var cFrom = Math.max(1, Math.min(state.hafalanAyatDari, hSurah.ayatCount));
        var cTo = Math.max(cFrom, Math.min(state.hafalanAyatSampai, hSurah.ayatCount));
        var finalStatus =
          cTo >= hSurah.ayatCount && state.statusHafalan === 'Lanjut'
            ? 'Tuntas Surat'
            : state.statusHafalan;
        hafalanEntry = {
          kategori: state.hafalanKategori,
          surahNumber: hSurah.number,
          surahName: hSurah.name,
          totalAyat: hSurah.ayatCount,
          ayatDari: cFrom,
          ayatSampai: cTo,
          predikat: state.predikatHafalan,
          statusHafalan: finalStatus,
          catatan: state.catatanHafalan.trim() || undefined,
        };
      }

      var payload = {
        studentId: state.journalStudentId,
        tanggal: state.journalDate,
        hari: D.getDayNameIndo(state.journalDate) || 'Senin',
        waktuSesi: "Ba'da Dzuhur",
        semester: store.settings.semesterAktif,
        tahunAjaran: store.settings.tahunAjaran,
        kehadiran: state.journalAttendance,
        bacaan: bacaanEntry,
        hafalan: hafalanEntry,
      };

      if (state.editingSessionId) {
        D.updateSession(state.editingSessionId, payload);
        state.editingSessionId = null;
        showToast('Perubahan setoran berhasil disimpan.');
      } else {
        D.addSession(payload);
        showToast(
          'Setoran ' + D.formatTanggalSingkat(state.journalDate) + " ba'da Dzuhur tersimpan."
        );
      }

      hydrateJournalDefaultsForStudent(state.journalStudentId);
      renderJournalView();
    };
  }

  /* ==================== MANAJEMEN KELAS & SISWA ==================== */

  function renderStudentsView() {
    var container = document.getElementById('view-students');
    if (!container) return;

    var store = D.loadStore();
    var currentUser = D.getCurrentUser();
    var isAdmin = currentUser && currentUser.role === 'admin';

    var classesList = ['Semua'].concat(
      store.classes.map(function (c) {
        return c.nama;
      })
    );

    if (
      state.stuClass !== 'Semua' &&
      !store.classes.some(function (c) {
        return c.nama === state.stuClass;
      })
    ) {
      state.stuClass = 'Semua';
    }

    var q = state.stuSearch.trim().toLowerCase();
    var filtered = store.students.filter(function (s) {
      var okClass = state.stuClass === 'Semua' || s.kelas === state.stuClass;
      var okSearch =
        !q ||
        s.nama.toLowerCase().indexOf(q) !== -1 ||
        s.nisn.toLowerCase().indexOf(q) !== -1 ||
        s.guruPembimbing.toLowerCase().indexOf(q) !== -1;
      return okClass && okSearch;
    });

    var stuPageSize = 25;
    var totalPages = Math.max(1, Math.ceil(filtered.length / stuPageSize));
    if (state.stuPage > totalPages) state.stuPage = totalPages;
    var pagedStudents = filtered.slice((state.stuPage - 1) * stuPageSize, state.stuPage * stuPageSize);

    var classCardsHtml =
      store.classes.length === 0
        ? '<div class="col-span-full rounded-xl border border-dashed border-[#C7D6CF] bg-white p-8 text-center">' +
          '<p class="text-sm font-medium text-[#2A423A]">Belum ada rombongan belajar / kelas.</p>' +
          '<p class="mt-1 text-xs text-[#5E756D]">Klik tombol <strong>+ Tambah Kelas</strong> untuk membuat kelas (misal 1A, 2A, dst.).</p>' +
          '</div>'
        : store.classes
            .map(function (cls) {
              var count = store.students.filter(function (s) {
                return s.kelas === cls.nama;
              }).length;
              return (
                '<div class="flex flex-col justify-between rounded-xl border border-[#DCE5E1] bg-white p-4">' +
                '<div><div class="flex items-center justify-between gap-2">' +
                '<button type="button" data-select-class-card="' +
                D.escapeHtml(cls.nama) +
                '" class="text-left text-base font-bold text-[#112A22] hover:text-[#0D7A5F]">Kelas ' +
                D.escapeHtml(cls.nama) +
                '</button>' +
                '<span class="font-mono text-xs font-semibold text-[#0D7A5F] tabular-nums">' +
                count +
                ' siswa</span></div>' +
                '<div class="mt-1 text-xs text-[#5E756D]">Tingkat ' +
                cls.tingkat +
                ' · Wali: ' +
                D.escapeHtml(cls.waliKelas) +
                '</div>' +
                '<div class="mt-0.5 text-xs text-[#3C554C]">Pembimbing: ' +
                D.escapeHtml(cls.guruPembimbing) +
                '</div></div>' +
                (isAdmin
                  ? '<div class="mt-3 flex items-center justify-end gap-1.5 border-t border-[#EDF2F0] pt-2.5">' +
                    '<button type="button" data-cls-edit="' +
                    D.escapeHtml(cls.id) +
                    '" class="min-h-[30px] rounded-md border border-[#D4DFDA] px-2.5 py-1 text-[11px] font-medium text-[#2A423A] hover:bg-[#F3F7F5]">Edit</button>' +
                    '<button type="button" data-cls-delete="' +
                    D.escapeHtml(cls.id) +
                    '" class="min-h-[30px] rounded-md border border-rose-200 px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50">Hapus</button></div>'
                  : '') +
                '</div>'
              );
            })
            .join('');

    var rowsHtml = '';
    if (pagedStudents.length === 0) {
      rowsHtml =
        '<tr><td colspan="6" class="px-6 py-10 text-center text-sm text-[#5E756D]">' +
        (store.students.length === 0
          ? 'Belum ada data siswa. Setelah membuat kelas, klik <strong>+ Tambah Siswa Baru</strong>.'
          : 'Belum ada data siswa yang sesuai filter.') +
        '</td></tr>';
    } else {
      rowsHtml = pagedStudents
        .map(function (stu) {
          var lastRead = D.getLastReadingSession(stu.id, store.sessions);
          var tahfidz = D.getStudentTahfidzSummary(stu, store.sessions);
          return (
            '<tr class="transition-colors hover:bg-[#F9FCFB]">' +
            '<td class="px-6 py-3.5"><div class="font-semibold text-[#112A22]">' +
            D.escapeHtml(stu.nama) +
            '</div><div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#5E756D]">' +
            '<span class="font-mono tabular-nums">NISN ' +
            D.escapeHtml(stu.nisn) +
            '</span><span>·</span><span>' +
            (stu.jenisKelamin === 'L' ? 'Putra' : 'Putri') +
            '</span><span>·</span><span>Wali: ' +
            D.escapeHtml(stu.namaWali) +
            '</span></div></td>' +
            '<td class="px-4 py-3.5 font-mono text-sm font-medium text-[#112A22]">' +
            D.escapeHtml(stu.kelas) +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs text-[#2A423A]">' +
            D.escapeHtml(stu.guruPembimbing) +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs text-[#3C554C]">' +
            (lastRead && lastRead.bacaan
              ? D.escapeHtml(D.formatReadingSummary(lastRead.bacaan))
              : 'Belum tercatat') +
            '</td>' +
            '<td class="px-4 py-3.5 text-xs">' +
            (tahfidz.isJuz30Complete
              ? '<div class="font-semibold text-[#0D7A5F]">Juz 30 Tuntas (37/37)</div><div class="mt-0.5 text-[#B78628]">5 Surat Pilihan: ' +
                tahfidz.pilihanCompletedCount +
                '/5 tuntas</div>'
              : '<div class="font-medium text-[#112A22]">Juz 30: ' +
                tahfidz.juz30CompletedCount +
                '/37 surat</div><div class="mt-0.5 text-[#5E756D]">Target: ' +
                D.escapeHtml(tahfidz.suggestedNextSurah.name) +
                '</div>') +
            '</td>' +
            '<td class="px-6 py-3.5 text-right"><div class="flex items-center justify-end gap-1.5">' +
            '<button type="button" data-stu-journal="' +
            D.escapeHtml(stu.id) +
            '" class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium text-[#0D7A5F] hover:bg-[#EFF7F4]">Ngaji</button>' +
            '<button type="button" data-stu-report="' +
            D.escapeHtml(stu.id) +
            '" class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium text-[#2A423A] hover:bg-[#F3F7F5]">Rapor</button>' +
            '<button type="button" data-stu-edit="' +
            D.escapeHtml(stu.id) +
            '" class="min-h-[34px] rounded-lg border border-[#D4DFDA] bg-white px-2.5 py-1 text-xs font-medium text-[#2A423A] hover:bg-[#F3F7F5]">Edit</button>' +
            '<button type="button" data-stu-delete="' +
            D.escapeHtml(stu.id) +
            '" class="min-h-[34px] rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>' +
            '</div></td></tr>'
          );
        })
        .join('');
    }

    var adminOnlySectionHtml = '';
    if (isAdmin) {
      var userRows = store.users
        .map(function (u) {
          var isCurrent = currentUser && currentUser.id === u.id;
          return (
            '<tr><td class="py-2.5 font-medium text-[#112A22]">' +
            D.escapeHtml(u.nama) +
            '<div class="text-xs text-[#5E756D]">' +
            D.escapeHtml(u.jabatan || '') +
            '</div></td>' +
            '<td class="py-2.5 font-mono text-xs text-[#2A423A]">' +
            D.escapeHtml(u.username) +
            '</td>' +
            '<td class="py-2.5 text-xs font-semibold text-[#0D7A5F]">' +
            D.escapeHtml(u.role.toUpperCase()) +
            '</td>' +
            '<td class="py-2.5 text-right">' +
            (!isCurrent
              ? '<button type="button" data-del-user="' +
                D.escapeHtml(u.id) +
                '" class="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>'
              : '<span class="text-xs text-[#869B93]">Aktif</span>') +
            '</td></tr>'
          );
        })
        .join('');

      adminOnlySectionHtml =
        '<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">' +
        '<form id="settings-form" class="rounded-xl border border-[#DCE5E1] bg-white p-6 lg:col-span-2">' +
        '<div class="border-b border-[#EDF2F0] pb-4"><h2 class="text-base font-semibold text-[#112A22]">Identitas Madrasah &amp; Pengaturan Rapor</h2>' +
        '<p class="mt-0.5 text-xs text-[#5E756D]">Data ini ditampilkan pada kop dan blok tanda tangan halaman Rapor Semester.</p></div>' +
        '<div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">' +
        '<div class="sm:col-span-2"><label class="block text-xs font-semibold text-[#3C554C]">Nama Madrasah Ibtidaiyah</label><input id="set-nama" type="text" placeholder="Madrasah Ibtidaiyah Darul Ulum Cilacap" value="' +
        D.escapeHtml(store.settings.namaMadrasah) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm" /></div>' +
        '<div class="sm:col-span-2"><label class="block text-xs font-semibold text-[#3C554C]">Alamat Madrasah</label><input id="set-alamat" type="text" placeholder="Alamat lengkap madrasah" value="' +
        D.escapeHtml(store.settings.alamatMadrasah) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Tahun Ajaran</label><input id="set-ta" type="text" value="' +
        D.escapeHtml(store.settings.tahunAjaran) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Semester Aktif</label><select id="set-sem" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm">' +
        '<option value="Ganjil"' +
        (store.settings.semesterAktif === 'Ganjil' ? ' selected' : '') +
        '>Semester Ganjil</option>' +
        '<option value="Genap"' +
        (store.settings.semesterAktif === 'Genap' ? ' selected' : '') +
        '>Semester Genap</option></select></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Nama Kepala Madrasah</label><input id="set-kepala" type="text" placeholder="Nama lengkap &amp; gelar" value="' +
        D.escapeHtml(store.settings.namaKepalaMadrasah) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">NIP Kepala Madrasah</label><input id="set-nip" type="text" placeholder="NIP / NUPTK" value="' +
        D.escapeHtml(store.settings.nipKepalaMadrasah) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Kota Penandatanganan</label><input id="set-kota" type="text" placeholder="Nama kota/kecamatan" value="' +
        D.escapeHtml(store.settings.kotaRapor) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 text-sm" /></div>' +
        '<div><label class="block text-xs font-semibold text-[#3C554C]">Tanggal Titi Mangsa Rapor</label><input id="set-tgl" type="date" value="' +
        D.escapeHtml(store.settings.tanggalRapor) +
        '" class="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4DFDA] px-3 font-mono text-sm" /></div>' +
        '</div><div class="mt-5 flex justify-end border-t border-[#EDF2F0] pt-4">' +
        '<button type="submit" class="min-h-[42px] rounded-lg bg-[#0D7A5F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#09624C]">Simpan Pengaturan Madrasah</button></div></form>' +
        '<div class="space-y-6">' +
        '<section class="rounded-xl border border-[#DCE5E1] bg-white p-6">' +
        '<div class="flex items-center justify-between border-b border-[#EDF2F0] pb-3">' +
        '<h2 class="text-base font-semibold text-[#112A22]">Akun Guru &amp; Admin</h2>' +
        '<button type="button" id="btn-add-user" class="rounded-lg bg-[#0D7A5F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#09624C]">+ Akun</button></div>' +
        '<p class="mt-2 text-xs text-[#5E756D]">Wali murid login otomatis memakai <strong>NISN anak</strong> (sandi <span class="font-mono">wali123</span>).</p>' +
        '<table class="mt-3 w-full text-left text-xs"><tbody class="divide-y divide-[#EDF2F0]">' +
        userRows +
        '</tbody></table></section>' +
        '<section class="rounded-xl border border-[#DCE5E1] bg-white p-6">' +
        '<h2 class="text-base font-semibold text-[#112A22]">Cadangan &amp; Reset Data</h2>' +
        '<div class="mt-4 space-y-2.5">' +
        '<button type="button" id="btn-export-json" class="flex min-h-[40px] w-full items-center justify-center rounded-lg border border-[#D4DFDA] bg-white px-4 py-2 text-xs font-semibold text-[#112A22] hover:bg-[#F3F7F5]">Unduh Backup Data (.JSON)</button>' +
        '<label class="flex min-h-[40px] w-full cursor-pointer items-center justify-center rounded-lg border border-[#D4DFDA] bg-white px-4 py-2 text-xs font-semibold text-[#112A22] hover:bg-[#F3F7F5]">Pulihkan dari File JSON<input id="input-import-json" type="file" accept="application/json" class="hidden" /></label>' +
        '<button type="button" id="btn-clear-all" class="flex min-h-[40px] w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50/60 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">Kosongkan Semua Data Aplikasi</button>' +
        '</div></section></div></div>';
    }

    container.innerHTML =
      '<div class="space-y-8">' +
      '<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">' +
      '<div><h1 class="text-2xl font-bold tracking-tight text-[#112A22]">Manajemen Kelas (1–6) &amp; Data Santri</h1>' +
      '<p class="mt-1 text-sm text-[#4D645C]">Total ' +
      store.classes.length +
      ' rombongan belajar dan ' +
      store.students.length +
      ' siswa MI terdaftar aktif.</p></div>' +
      '<div class="flex flex-wrap items-center gap-2">' +
      (isAdmin
        ? '<button type="button" id="cls-add-btn" class="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#0D7A5F] bg-white px-4 py-2 text-sm font-semibold text-[#0D7A5F] hover:bg-[#EFF7F4] whitespace-nowrap shrink-0">+ Tambah Kelas</button>'
        : '') +
      '<button type="button" id="stu-add-btn" class="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0D7A5F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#09624C] whitespace-nowrap shrink-0">+ Tambah Siswa Baru</button></div></div>' +
      '<section class="space-y-3">' +
      '<div class="flex items-center justify-between"><h2 class="text-sm font-semibold text-[#2A423A]">Daftar Rombongan Belajar</h2></div>' +
      '<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">' +
      classCardsHtml +
      '</div></section>' +
      '<section class="rounded-xl border border-[#DCE5E1] bg-white">' +
      '<div class="flex flex-col gap-3 border-b border-[#E7EEEB] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">' +
      '<input id="stu-search-input" type="text" value="' +
      D.escapeHtml(state.stuSearch) +
      '" placeholder="Cari nama, NISN, atau pembimbing..." class="min-h-[40px] w-full rounded-lg border border-[#D4DFDA] bg-[#FAFDFC] px-3 text-sm text-[#112A22] sm:max-w-xs" />' +
      '<div class="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1F5F3] p-1">' +
      classesList
        .map(function (cls) {
          return (
            '<button type="button" data-stu-class="' +
            D.escapeHtml(cls) +
            '" class="min-h-[34px] rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap ' +
            (state.stuClass === cls ? 'bg-white text-[#112A22] shadow-xs' : 'text-[#4D645C]') +
            '">' +
            (cls === 'Semua' ? 'Semua' : 'Kls ' + D.escapeHtml(cls)) +
            '</button>'
          );
        })
        .join('') +
      '</div></div>' +
      '<div class="flex items-center justify-between border-b border-[#EDF2F0] bg-[#FAFDFC] px-6 py-2.5 text-xs text-[#5E756D]">' +
      '<span>Menampilkan ' +
      pagedStudents.length +
      ' dari ' +
      filtered.length +
      ' siswa (Hal. ' +
      state.stuPage +
      '/' +
      totalPages +
      ')</span>' +
      '<div class="flex items-center gap-1.5">' +
      '<button type="button" id="stu-page-prev" ' +
      (state.stuPage <= 1 ? 'disabled ' : '') +
      'class="rounded border border-[#D4DFDA] bg-white px-2.5 py-1 font-medium disabled:opacity-40">Prev</button>' +
      '<button type="button" id="stu-page-next" ' +
      (state.stuPage >= totalPages ? 'disabled ' : '') +
      'class="rounded border border-[#D4DFDA] bg-white px-2.5 py-1 font-medium disabled:opacity-40">Next</button>' +
      '</div></div>' +
      '<div class="overflow-x-auto"><table class="w-full min-w-[780px] text-left text-sm">' +
      '<thead><tr class="border-b border-[#E7EEEB] bg-[#FAFDFC] text-xs font-semibold text-[#556D65]">' +
      '<th class="px-6 py-3.5">Identitas Siswa</th><th class="px-4 py-3.5">Kelas</th>' +
      '<th class="px-4 py-3.5">Guru Pembimbing</th><th class="px-4 py-3.5">Bacaan Terakhir</th>' +
      '<th class="px-4 py-3.5">Tahfidz</th><th class="px-6 py-3.5 text-right">Tindakan</th></tr></thead>' +
      '<tbody class="divide-y divide-[#EDF2F0]">' +
      rowsHtml +
      '</tbody></table></div></section>' +
      adminOnlySectionHtml +
      '</div>';

    var clsAddBtn = document.getElementById('cls-add-btn');
    if (clsAddBtn) {
      clsAddBtn.onclick = function () {
        openClassModal(null);
      };
    }
    container.querySelectorAll('[data-select-class-card]').forEach(function (btn) {
      btn.onclick = function () {
        state.stuClass = btn.getAttribute('data-select-class-card');
        state.stuPage = 1;
        renderStudentsView();
      };
    });
    container.querySelectorAll('[data-cls-edit]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-cls-edit');
        var cls = D.loadStore().classes.find(function (c) {
          return c.id === id;
        });
        if (cls) openClassModal(cls);
      };
    });
    container.querySelectorAll('[data-cls-delete]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-cls-delete');
        var curStore = D.loadStore();
        var cls = curStore.classes.find(function (c) {
          return c.id === id;
        });
        if (!cls) return;
        var hasStudents = curStore.students.some(function (s) {
          return s.kelas === cls.nama;
        });
        if (hasStudents) {
          showToast(
            'Kelas ' + cls.nama + ' masih memiliki siswa aktif. Pindahkan atau hapus siswa terlebih dahulu.',
            true
          );
          return;
        }
        openConfirmModal(
          'Hapus Kelas ' + cls.nama + '?',
          'Kelas kosong ini akan dihapus dari daftar rombongan belajar.',
          'Hapus Kelas',
          function () {
            D.deleteClass(id);
            closeConfirmModal();
            showToast('Kelas ' + cls.nama + ' berhasil dihapus.');
            renderStudentsView();
          }
        );
      };
    });

    document.getElementById('stu-add-btn').onclick = function () {
      openStudentModal(null);
    };
    document.getElementById('stu-search-input').oninput = function (e) {
      state.stuSearch = e.target.value;
      state.stuPage = 1;
      renderStudentsView();
      var inp = document.getElementById('stu-search-input');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    };
    document.getElementById('stu-page-prev').onclick = function () {
      if (state.stuPage > 1) {
        state.stuPage--;
        renderStudentsView();
      }
    };
    document.getElementById('stu-page-next').onclick = function () {
      if (state.stuPage < totalPages) {
        state.stuPage++;
        renderStudentsView();
      }
    };
    container.querySelectorAll('[data-stu-class]').forEach(function (btn) {
      btn.onclick = function () {
        state.stuClass = btn.getAttribute('data-stu-class');
        state.stuPage = 1;
        renderStudentsView();
      };
    });
    container.querySelectorAll('[data-stu-journal]').forEach(function (btn) {
      btn.onclick = function () {
        navigateTo('journal', btn.getAttribute('data-stu-journal'));
      };
    });
    container.querySelectorAll('[data-stu-report]').forEach(function (btn) {
      btn.onclick = function () {
        navigateTo('report', btn.getAttribute('data-stu-report'));
      };
    });
    container.querySelectorAll('[data-stu-edit]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-stu-edit');
        var stu = D.loadStore().students.find(function (s) {
          return s.id === id;
        });
        if (stu) openStudentModal(stu);
      };
    });
    container.querySelectorAll('[data-stu-delete]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-stu-delete');
        var stu = D.loadStore().students.find(function (s) {
          return s.id === id;
        });
        openConfirmModal(
          'Hapus Data ' + (stu ? stu.nama : 'Siswa') + '?',
          'Menghapus siswa juga akan menghapus seluruh riwayat setoran Senin & Kamis milik siswa tersebut.',
          'Hapus Siswa',
          function () {
            D.deleteStudent(id);
            closeConfirmModal();
            showToast('Data siswa berhasil dihapus.');
            renderStudentsView();
          }
        );
      };
    });

    if (isAdmin) {
      document.getElementById('settings-form').onsubmit = function (e) {
        e.preventDefault();
        D.updateSettings({
          namaMadrasah: document.getElementById('set-nama').value.trim(),
          alamatMadrasah: document.getElementById('set-alamat').value.trim(),
          tahunAjaran: document.getElementById('set-ta').value.trim(),
          semesterAktif: document.getElementById('set-sem').value,
          namaKepalaMadrasah: document.getElementById('set-kepala').value.trim(),
          nipKepalaMadrasah: document.getElementById('set-nip').value.trim(),
          kotaRapor: document.getElementById('set-kota').value.trim(),
          tanggalRapor: document.getElementById('set-tgl').value,
        });
        showToast('Pengaturan madrasah berhasil disimpan.');
      };

      document.getElementById('btn-add-user').onclick = openUserModal;
      container.querySelectorAll('[data-del-user]').forEach(function (btn) {
        btn.onclick = function () {
          var uid = btn.getAttribute('data-del-user');
          D.deleteUserAccount(uid);
          showToast('Akun pengguna dihapus.');
          renderStudentsView();
        };
      });

      document.getElementById('btn-export-json').onclick = function () {
        var dataStr = JSON.stringify(D.loadStore(), null, 2);
        var blob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'backup-rapor-roodoh-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
      };

      document.getElementById('input-import-json').onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(String(reader.result));
            if (!Array.isArray(parsed.students) || !Array.isArray(parsed.sessions)) {
              showToast('Format file backup JSON tidak valid.', true);
              return;
            }
            D.saveStore({
              classes: parsed.classes || [],
              students: parsed.students,
              sessions: parsed.sessions,
              users: parsed.users || D.loadStore().users,
              settings: parsed.settings || D.loadStore().settings,
            });
            showToast('Data backup berhasil dipulihkan.');
            renderStudentsView();
          } catch (err) {
            showToast('Gagal membaca file JSON.', true);
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      };

      document.getElementById('btn-clear-all').onclick = function () {
        openConfirmModal(
          'Kosongkan Semua Data Aplikasi?',
          'Seluruh kelas, siswa, riwayat setoran, dan akun pengguna akan dihapus sehingga aplikasi kembali kosong seperti semula.',
          'Kosongkan Semua',
          function () {
            D.clearAllData();
            closeConfirmModal();
            checkAuthAndRender();
          }
        );
      };
    }
  }

  /* ==================== MODALS: SISWA, KELAS, AKUN ==================== */

  function openStudentModal(student) {
    var store = D.loadStore();
    if (!student && store.classes.length === 0) {
      showToast('Buat minimal 1 kelas terlebih dahulu sebelum menambahkan siswa.', true);
      openClassModal(null);
      return;
    }

    var modal = document.getElementById('student-modal');
    if (!modal) return;
    var classSelect = document.getElementById('stu-input-kelas');
    classSelect.innerHTML = store.classes
      .map(function (c) {
        return '<option value="' + D.escapeHtml(c.nama) + '">Kelas ' + D.escapeHtml(c.nama) + '</option>';
      })
      .join('');

    state.editingStudentId = student ? student.id : null;
    document.getElementById('stu-modal-title').textContent = student
      ? 'Edit Data Siswa'
      : 'Tambah Siswa MI Baru';
    document.getElementById('stu-input-nama').value = student ? student.nama : '';
    document.getElementById('stu-input-nisn').value = student ? student.nisn : '';
    var hasFilterClass = store.classes.some(function (c) {
      return c.nama === state.stuClass;
    });
    classSelect.value = student
      ? student.kelas
      : hasFilterClass
        ? state.stuClass
        : store.classes[0] ? store.classes[0].nama : '';
    document.getElementById('stu-input-jk').value = student ? student.jenisKelamin : 'L';
    document.getElementById('stu-input-wali').value = student ? student.namaWali : '';

    var matchedCls = store.classes.find(function (c) {
      return c.nama === classSelect.value;
    });
    var guruInput = document.getElementById('stu-input-guru');
    guruInput.value = student
      ? student.guruPembimbing
      : matchedCls ? matchedCls.guruPembimbing : '';
    classSelect.onchange = function () {
      if (!state.editingStudentId) {
        var clsObj = D.loadStore().classes.find(function (c) {
          return c.nama === classSelect.value;
        });
        if (clsObj) guruInput.value = clsObj.guruPembimbing;
      }
    };
    document.getElementById('stu-input-juz30').checked = Boolean(
      student && student.juz30TuntasBaseline
    );
    document.getElementById('stu-modal-error').classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function closeStudentModal() {
    var modal = document.getElementById('student-modal');
    if (modal) modal.classList.add('hidden');
    state.editingStudentId = null;
  }

  function openClassModal(cls) {
    var modal = document.getElementById('class-modal');
    if (!modal) return;
    state.editingClassId = cls ? cls.id : null;
    document.getElementById('cls-modal-title').textContent = cls
      ? 'Edit Kelas ' + cls.nama
      : 'Tambah Kelas Baru';
    document.getElementById('cls-input-nama').value = cls ? cls.nama : '';
    document.getElementById('cls-input-tingkat').value = cls ? String(cls.tingkat) : '1';
    document.getElementById('cls-input-guru').value = cls ? cls.guruPembimbing : '';
    document.getElementById('cls-input-wali').value = cls ? cls.waliKelas : '';
    document.getElementById('cls-modal-error').classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function closeClassModal() {
    var modal = document.getElementById('class-modal');
    if (modal) modal.classList.add('hidden');
    state.editingClassId = null;
  }

  function openUserModal() {
    var modal = document.getElementById('user-modal');
    if (!modal) return;
    document.getElementById('usr-input-nama').value = '';
    document.getElementById('usr-input-username').value = '';
    document.getElementById('usr-input-password').value = '';
    document.getElementById('usr-input-role').value = 'guru';
    document.getElementById('usr-input-jabatan').value = 'Guru Pembimbing Roodoh';
    modal.classList.remove('hidden');
  }

  function closeUserModal() {
    var modal = document.getElementById('user-modal');
    if (modal) modal.classList.add('hidden');
  }

  /* ==================== INISIALISASI HALAMAN ==================== */

  function init() {
    document.querySelectorAll('[data-nav-tab]').forEach(function (btn) {
      btn.onclick = function () {
        navigateTo(btn.getAttribute('data-nav-tab'));
      };
    });

    var mobileToggle = document.getElementById('mobile-menu-toggle');
    if (mobileToggle) mobileToggle.onclick = toggleMobileMenu;

    var brandBtn = document.getElementById('brand-home-btn');
    if (brandBtn) {
      brandBtn.onclick = function () {
        navigateTo('dashboard');
      };
    }

    var logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.onclick = function () {
        D.logoutUser();
        checkAuthAndRender();
      };
    }

    document.getElementById('confirm-modal-cancel').onclick = closeConfirmModal;
    document.getElementById('confirm-modal-close').onclick = closeConfirmModal;
    document.getElementById('confirm-modal-btn').onclick = function () {
      if (typeof state.pendingConfirmFn === 'function') {
        state.pendingConfirmFn();
      }
    };

    document.getElementById('stu-modal-close').onclick = closeStudentModal;
    document.getElementById('stu-modal-cancel').onclick = closeStudentModal;
    document.getElementById('student-modal-form').onsubmit = function (e) {
      e.preventDefault();
      var nama = document.getElementById('stu-input-nama').value.trim();
      var nisn = document.getElementById('stu-input-nisn').value.trim();
      var kelas = document.getElementById('stu-input-kelas').value.trim();
      var guru = document.getElementById('stu-input-guru').value.trim();
      var errEl = document.getElementById('stu-modal-error');

      if (!nama || !nisn || !kelas || !guru) {
        errEl.textContent = 'Nama lengkap, NISN, kelas, dan guru pembimbing wajib diisi.';
        errEl.classList.remove('hidden');
        return;
      }

      var payload = {
        nama: nama,
        nisn: nisn,
        kelas: kelas,
        jenisKelamin: document.getElementById('stu-input-jk').value,
        namaWali: document.getElementById('stu-input-wali').value.trim() || '-',
        guruPembimbing: guru,
        juz30TuntasBaseline: document.getElementById('stu-input-juz30').checked,
      };

      if (state.editingStudentId) {
        D.updateStudent(state.editingStudentId, payload);
        showToast('Data siswa berhasil diperbarui.');
      } else {
        D.addStudent(payload);
        showToast('Siswa baru berhasil ditambahkan.');
      }
      closeStudentModal();
      renderStudentsView();
    };

    document.getElementById('cls-modal-close').onclick = closeClassModal;
    document.getElementById('cls-modal-cancel').onclick = closeClassModal;
    document.getElementById('class-modal-form').onsubmit = function (e) {
      e.preventDefault();
      var nama = document.getElementById('cls-input-nama').value.trim().toUpperCase();
      var tingkat = Number(document.getElementById('cls-input-tingkat').value);
      var guru = document.getElementById('cls-input-guru').value.trim();
      var wali = document.getElementById('cls-input-wali').value.trim();
      var errEl = document.getElementById('cls-modal-error');

      if (!nama || !guru) {
        errEl.textContent = 'Nama kelas (misal 1A) dan nama guru pembimbing wajib diisi.';
        errEl.classList.remove('hidden');
        return;
      }

      var store = D.loadStore();
      var duplicate = store.classes.some(function (c) {
        return c.nama === nama && c.id !== state.editingClassId;
      });
      if (duplicate) {
        errEl.textContent = 'Kelas ' + nama + ' sudah ada. Gunakan nama lain.';
        errEl.classList.remove('hidden');
        return;
      }

      if (state.editingClassId) {
        D.updateClass(state.editingClassId, {
          nama: nama,
          tingkat: tingkat,
          guruPembimbing: guru,
          waliKelas: wali || '-',
        });
        showToast('Data kelas ' + nama + ' berhasil diperbarui.');
      } else {
        D.addClass({
          nama: nama,
          tingkat: tingkat,
          guruPembimbing: guru,
          waliKelas: wali || '-',
        });
        state.stuClass = nama;
        showToast('Kelas ' + nama + ' berhasil ditambahkan.');
      }
      closeClassModal();
      renderStudentsView();
    };

    document.getElementById('usr-modal-close').onclick = closeUserModal;
    document.getElementById('usr-modal-cancel').onclick = closeUserModal;
    document.getElementById('user-modal-form').onsubmit = function (e) {
      e.preventDefault();
      var nama = document.getElementById('usr-input-nama').value.trim();
      var username = document.getElementById('usr-input-username').value.trim().toLowerCase();
      var password = document.getElementById('usr-input-password').value.trim();
      if (!nama || !username || !password) return;

      D.addUserAccount({
        nama: nama,
        username: username,
        password: password,
        role: document.getElementById('usr-input-role').value,
        jabatan: document.getElementById('usr-input-jabatan').value.trim() || 'Guru Pembimbing',
      });
      closeUserModal();
      showToast('Akun pengguna baru berhasil dibuat.');
      renderStudentsView();
    };

    checkAuthAndRender();
  }

  document.addEventListener('DOMContentLoaded', init);

  global.RoodohAbsensi = {
    navigateTo: navigateTo,
    renderDashboard: renderDashboard,
    renderJournalView: renderJournalView,
    renderStudentsView: renderStudentsView,
  };
})(window);
