/**
 * js/supabase.js
 * Inisialisasi koneksi client Supabase untuk aplikasi
 * RAPOR NGAJI MADRASAH IBTIDAIYAH DARUL ULUM CILACAP.
 *
 * CATATAN KEAMANAN:
 * - Hanya gunakan Project URL (https://xxxx.supabase.co) dan Publishable Key (sb_publishable_...).
 * - JANGAN PERNAH menaruh Secret Key (sb_secret_...) di file browser/frontend.
 */
(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://yatsqrmjqmvqrfudulsb.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YCo_gHXpOMWHzUQdhwUNxA_sdkx2cYg';

  var client = null;

  function isValidHttpUrl(val) {
    return (
      typeof val === 'string' &&
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(val.trim()) &&
      val.indexOf('GANTI_DENGAN_PROJECT_REF') === -1
    );
  }

  function isConfigured() {
    return (
      isValidHttpUrl(SUPABASE_URL) &&
      typeof SUPABASE_KEY === 'string' &&
      SUPABASE_KEY.trim().length > 0 &&
      SUPABASE_KEY.indexOf('sb_secret_') !== 0 &&
      Boolean(global.supabase && typeof global.supabase.createClient === 'function')
    );
  }

  function getClient() {
    if (client) return client;
    if (!isConfigured()) return null;
    client = global.supabase.createClient(SUPABASE_URL.trim(), SUPABASE_KEY.trim());
    global.supabaseClient = client;
    return client;
  }

  function mapSettingsToRow(s) {
    return {
      id: 'default',
      nama_madrasah: s.namaMadrasah || 'Madrasah Ibtidaiyah Darul Ulum Cilacap',
      alamat_madrasah: s.alamatMadrasah || '',
      tahun_ajaran: s.tahunAjaran || '2026/2027',
      semester_aktif: s.semesterAktif || 'Ganjil',
      nama_kepala_madrasah: s.namaKepalaMadrasah || '',
      nip_kepala_madrasah: s.nipKepalaMadrasah || '',
      kota_rapor: s.kotaRapor || 'Cilacap',
      tanggal_rapor: s.tanggalRapor || '',
      updated_at: new Date().toISOString(),
    };
  }

  function mapRowToSettings(row) {
    if (!row) return null;
    return {
      namaMadrasah: row.nama_madrasah || 'Madrasah Ibtidaiyah Darul Ulum Cilacap',
      alamatMadrasah: row.alamat_madrasah || '',
      tahunAjaran: row.tahun_ajaran || '2026/2027',
      semesterAktif: row.semester_aktif || 'Ganjil',
      namaKepalaMadrasah: row.nama_kepala_madrasah || '',
      nipKepalaMadrasah: row.nip_kepala_madrasah || '',
      kotaRapor: row.kota_rapor || 'Cilacap',
      tanggalRapor: row.tanggal_rapor || '',
    };
  }

  function mapUserToRow(u) {
    return {
      id: u.id,
      username: u.username,
      password: u.password,
      role: u.role,
      nama: u.nama,
      jabatan: u.jabatan || 'Guru Pembimbing Roodoh',
      assigned_classes: Array.isArray(u.assignedClasses) ? u.assignedClasses : [],
    };
  }

  function mapRowToUser(r) {
    return {
      id: r.id,
      username: r.username,
      password: r.password,
      role: r.role,
      nama: r.nama,
      jabatan: r.jabatan || 'Guru Pembimbing Roodoh',
      assignedClasses: Array.isArray(r.assigned_classes) ? r.assigned_classes : [],
    };
  }

  function mapClassToRow(c) {
    return {
      id: c.id,
      nama: c.nama,
      tingkat: Number(c.tingkat) || 1,
      guru_pembimbing: c.guruPembimbing || '',
      wali_kelas: c.waliKelas || '-',
    };
  }

  function mapRowToClass(r) {
    return {
      id: r.id,
      nama: r.nama,
      tingkat: Number(r.tingkat) || 1,
      guruPembimbing: r.guru_pembimbing || '',
      waliKelas: r.wali_kelas || '-',
    };
  }

  function mapStudentToRow(s) {
    return {
      id: s.id,
      nisn: s.nisn,
      nama: s.nama,
      kelas: s.kelas,
      jenis_kelamin: s.jenisKelamin === 'P' ? 'P' : 'L',
      guru_pembimbing: s.guruPembimbing || '',
      nama_wali: s.namaWali || '-',
      juz30_tuntas_baseline: Boolean(s.juz30TuntasBaseline),
      catatan_semester: s.catatanSemester || {},
      created_at: s.createdAt || new Date().toISOString(),
    };
  }

  function mapRowToStudent(r) {
    return {
      id: r.id,
      nisn: r.nisn,
      nama: r.nama,
      kelas: r.kelas,
      jenisKelamin: r.jenis_kelamin === 'P' ? 'P' : 'L',
      guruPembimbing: r.guru_pembimbing || '',
      namaWali: r.nama_wali || '-',
      juz30TuntasBaseline: Boolean(r.juz30_tuntas_baseline),
      catatanSemester: r.catatan_semester || {},
      createdAt: r.created_at || new Date().toISOString(),
    };
  }

  function mapSessionToRow(ses) {
    return {
      id: ses.id,
      student_id: ses.studentId,
      tanggal: ses.tanggal,
      hari: ses.hari,
      waktu_sesi: ses.waktuSesi || "Ba'da Dzuhur",
      semester: ses.semester,
      tahun_ajaran: ses.tahunAjaran,
      kehadiran: ses.kehadiran,
      bacaan: ses.bacaan || null,
      hafalan: ses.hafalan || null,
      created_at: ses.createdAt || new Date().toISOString(),
    };
  }

  function mapRowToSession(r) {
    return {
      id: r.id,
      studentId: r.student_id,
      tanggal: r.tanggal,
      hari: r.hari,
      waktuSesi: r.waktu_sesi || "Ba'da Dzuhur",
      semester: r.semester,
      tahunAjaran: r.tahun_ajaran,
      kehadiran: r.kehadiran,
      bacaan: r.bacaan || null,
      hafalan: r.hafalan || null,
      createdAt: r.created_at || new Date().toISOString(),
    };
  }

  function fetchAllStore() {
    var sb = getClient();
    if (!sb) return Promise.resolve(null);

    return Promise.all([
      sb.from('roodoh_settings').select('*').eq('id', 'default').maybeSingle(),
      sb.from('roodoh_users').select('*'),
      sb.from('roodoh_classes').select('*').order('tingkat', { ascending: true }).order('nama', { ascending: true }),
      sb.from('roodoh_students').select('*').order('nama', { ascending: true }),
      sb.from('roodoh_sessions').select('*').order('tanggal', { ascending: false }),
    ]).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].error) {
          throw results[i].error;
        }
      }
      return {
        settings: mapRowToSettings(results[0].data),
        users: (results[1].data || []).map(mapRowToUser),
        classes: (results[2].data || []).map(mapRowToClass),
        students: (results[3].data || []).map(mapRowToStudent),
        sessions: (results[4].data || []).map(mapRowToSession),
      };
    });
  }

  function safeRun(promise) {
    if (!promise || typeof promise.then !== 'function') return Promise.resolve();
    return promise.then(
      function (res) {
        if (res && res.error) {
          console.error('Supabase sync error:', res.error.message || res.error);
        }
        return res;
      },
      function (err) {
        console.error('Supabase request failed:', err);
      }
    );
  }

  function upsertSettings(settings) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_settings').upsert(mapSettingsToRow(settings)));
  }

  function upsertUser(user) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_users').upsert(mapUserToRow(user)));
  }

  function deleteUser(userId) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_users').delete().eq('id', userId));
  }

  function upsertClass(cls) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_classes').upsert(mapClassToRow(cls)));
  }

  function deleteClass(classId) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_classes').delete().eq('id', classId));
  }

  function upsertStudent(stu) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_students').upsert(mapStudentToRow(stu)));
  }

  function deleteStudent(studentId) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_students').delete().eq('id', studentId));
  }

  function renameStudentClass(oldName, newName) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_students').update({ kelas: newName }).eq('kelas', oldName));
  }

  function upsertSession(ses) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_sessions').upsert(mapSessionToRow(ses)));
  }

  function deleteSession(sessionId) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_sessions').delete().eq('id', sessionId));
  }

  function clearAllRemote() {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return safeRun(sb.from('roodoh_sessions').delete().neq('id', ''))
      .then(function () {
        return safeRun(sb.from('roodoh_students').delete().neq('id', ''));
      })
      .then(function () {
        return safeRun(sb.from('roodoh_classes').delete().neq('id', ''));
      })
      .then(function () {
        return safeRun(sb.from('roodoh_users').delete().neq('id', ''));
      })
      .then(function () {
        return safeRun(sb.from('roodoh_settings').delete().neq('id', ''));
      });
  }

  function replaceAllFromBackup(store) {
    var sb = getClient();
    if (!sb) return Promise.resolve();
    return clearAllRemote().then(function () {
      var tasks = [];
      if (store.settings) tasks.push(upsertSettings(store.settings));
      if (Array.isArray(store.users) && store.users.length > 0) {
        tasks.push(safeRun(sb.from('roodoh_users').upsert(store.users.map(mapUserToRow))));
      }
      if (Array.isArray(store.classes) && store.classes.length > 0) {
        tasks.push(safeRun(sb.from('roodoh_classes').upsert(store.classes.map(mapClassToRow))));
      }
      return Promise.all(tasks)
        .then(function () {
          if (Array.isArray(store.students) && store.students.length > 0) {
            return safeRun(sb.from('roodoh_students').upsert(store.students.map(mapStudentToRow)));
          }
        })
        .then(function () {
          if (Array.isArray(store.sessions) && store.sessions.length > 0) {
            return safeRun(sb.from('roodoh_sessions').upsert(store.sessions.map(mapSessionToRow)));
          }
        });
    });
  }

  // Inisialisasi langsung jika URL valid sudah diisi
  getClient();

  global.RoodohSupabase = {
    SUPABASE_URL: SUPABASE_URL,
    isConfigured: isConfigured,
    getClient: getClient,
    fetchAllStore: fetchAllStore,
    upsertSettings: upsertSettings,
    upsertUser: upsertUser,
    deleteUser: deleteUser,
    upsertClass: upsertClass,
    deleteClass: deleteClass,
    upsertStudent: upsertStudent,
    deleteStudent: deleteStudent,
    renameStudentClass: renameStudentClass,
    upsertSession: upsertSession,
    deleteSession: deleteSession,
    clearAllRemote: clearAllRemote,
    replaceAllFromBackup: replaceAllFromBackup,
  };
})(window);
