/**
 * js/rapor.js
 * Khusus menghandle rekapitulasi rapor akhir semester dan fungsi cetak / ekspor PDF
 * dengan format kertas A4 Portrait (mendukung filter kelas & kontrol akses Admin, Guru, Wali Murid).
 */
(function (global) {
  'use strict';

  var D = global.RoodohData;

  var raporState = {
    classFilter: 'Semua',
    studentId: '',
    semester: '',
  };

  function getShortGrade(predikat) {
    if (!predikat) return '-';
    var match = String(predikat).match(/\(([^)]+)\)/);
    return match ? match[1] : predikat;
  }

  function renderSurahStatusText(rec) {
    if (rec.isTuntas) return 'Tuntas';
    if (rec.highestAyat > 0) return 'Ayat ' + rec.highestAyat + '/' + rec.surah.ayatCount;
    return '-';
  }

  function renderReport(preselectedStudentId) {
    var container = document.getElementById('view-report');
    if (!container) return;

    var store = D.loadStore();
    var currentUser = D.getCurrentUser();
    var isWali = currentUser && currentUser.role === 'wali';

    if (store.students.length === 0) {
      container.innerHTML =
        '<div class="rounded-xl border border-[#DCE5E1] bg-white p-10 text-center text-sm text-[#4D645C]">Belum ada data siswa untuk ditampilkan pada rapor semester.</div>';
      return;
    }

    if (isWali && currentUser.studentId) {
      raporState.studentId = currentUser.studentId;
    } else if (preselectedStudentId) {
      raporState.studentId = preselectedStudentId;
      var preStu = store.students.find(function (s) {
        return s.id === preselectedStudentId;
      });
      if (preStu) raporState.classFilter = preStu.kelas;
    }

    if (!raporState.semester) {
      raporState.semester = store.settings.semesterAktif;
    }

    var selectableStudents = isWali
      ? store.students.filter(function (s) {
          return s.id === currentUser.studentId;
        })
      : raporState.classFilter === 'Semua'
        ? store.students
        : store.students.filter(function (s) {
            return s.kelas === raporState.classFilter;
          });

    if (selectableStudents.length === 0) {
      selectableStudents = store.students;
      raporState.classFilter = 'Semua';
    }

    var student =
      selectableStudents.find(function (s) {
        return s.id === raporState.studentId;
      }) || selectableStudents[0];
    raporState.studentId = student.id;

    var semester = raporState.semester;
    var semesterKey = store.settings.tahunAjaran + '-' + semester;

    var semesterSessions = store.sessions
      .filter(function (s) {
        return (
          s.studentId === student.id &&
          s.semester === semester &&
          s.tahunAjaran === store.settings.tahunAjaran
        );
      })
      .sort(function (a, b) {
        return a.tanggal.localeCompare(b.tanggal);
      });

    var totalSes = semesterSessions.length;
    var hadirSes = semesterSessions.filter(function (s) {
      return s.kehadiran === 'Hadir';
    }).length;
    var izinSes = semesterSessions.filter(function (s) {
      return s.kehadiran === 'Izin';
    }).length;
    var sakitSes = semesterSessions.filter(function (s) {
      return s.kehadiran === 'Sakit';
    }).length;
    var alfaSes = semesterSessions.filter(function (s) {
      return s.kehadiran === 'Alfa';
    }).length;
    var pctSes = totalSes > 0 ? Math.round((hadirSes / totalSes) * 100) : 0;

    var readSessions = semesterSessions.filter(function (s) {
      return Boolean(s.bacaan);
    });
    var firstRead = readSessions[0];
    var lastRead = readSessions[readSessions.length - 1];

    var tahfidz = D.getStudentTahfidzSummary(student, store.sessions);
    var currentNote = (student.catatanSemester && student.catatanSemester[semesterKey]) || '';
    var defaultNoteFallback =
      "Alhamdulillah, ananda mengikuti kegiatan ngaji rutin Senin & Kamis ba'da Dzuhur dengan baik. Diharapkan terus istiqamah muraja'ah di rumah.";

    var col1 = tahfidz.juz30Surahs.slice(0, 13);
    var col2 = tahfidz.juz30Surahs.slice(13, 25);
    var col3 = tahfidz.juz30Surahs.slice(25, 37);

    var juz30TablesHtml = [col1, col2, col3]
      .map(function (col) {
        var bodyRows = col
          .map(function (rec) {
            var colorCls = rec.isTuntas
              ? 'font-semibold text-[#0D7A5F]'
              : rec.highestAyat > 0
                ? 'text-[#B78628]'
                : 'text-[#869B93]';
            return (
              '<tr>' +
              '<td class="border border-[#DCE5E1] px-1.5 py-0.5 font-medium text-[#112A22]">' +
              D.escapeHtml(rec.surah.name) +
              '</td>' +
              '<td class="border border-[#DCE5E1] px-1.5 py-0.5 text-center font-mono tabular-nums ' +
              colorCls +
              '">' +
              D.escapeHtml(renderSurahStatusText(rec)) +
              '</td>' +
              '<td class="border border-[#DCE5E1] px-1.5 py-0.5 text-center font-mono font-semibold text-[#112A22]">' +
              D.escapeHtml(getShortGrade(rec.predikat)) +
              '</td></tr>'
            );
          })
          .join('');

        return (
          '<table class="w-full border-collapse border border-[#DCE5E1] text-[10.5px]">' +
          '<thead><tr class="bg-[#F3F7F5] text-[#2A423A]">' +
          '<th class="border border-[#DCE5E1] px-1.5 py-1 text-left font-semibold">Surat</th>' +
          '<th class="border border-[#DCE5E1] px-1.5 py-1 text-center font-semibold">Progres</th>' +
          '<th class="border border-[#DCE5E1] px-1.5 py-1 text-center font-semibold">Nilai</th>' +
          '</tr></thead><tbody>' +
          bodyRows +
          '</tbody></table>'
        );
      })
      .join('');

    var pilihanRowsHtml = tahfidz.pilihanSurahs
      .map(function (rec, index) {
        var statusLabel = !tahfidz.isJuz30Complete
          ? 'Tahap Juz 30'
          : rec.isTuntas
            ? 'Tuntas'
            : rec.highestAyat > 0
              ? 'Sedang Dihafal'
              : 'Belum Mulai';
        var statusCls = rec.isTuntas
          ? 'text-[#0D7A5F]'
          : rec.highestAyat > 0
            ? 'text-[#B78628]'
            : 'text-[#6B827A]';

        return (
          '<tr>' +
          '<td class="border border-[#DCE5E1] px-2.5 py-1 text-center font-mono tabular-nums">' +
          (index + 1) +
          '</td>' +
          '<td class="border border-[#DCE5E1] px-2.5 py-1 font-semibold text-[#112A22]">' +
          D.escapeHtml(rec.surah.name) +
          '</td>' +
          '<td class="border border-[#DCE5E1] px-2.5 py-1 text-center font-mono tabular-nums">' +
          rec.surah.ayatCount +
          ' ayat</td>' +
          '<td class="border border-[#DCE5E1] px-2.5 py-1 text-center font-mono tabular-nums">' +
          (rec.highestAyat > 0 ? 'Ayat 1–' + rec.highestAyat : '-') +
          '</td>' +
          '<td class="border border-[#DCE5E1] px-2.5 py-1 text-center font-semibold ' +
          statusCls +
          '">' +
          statusLabel +
          '</td>' +
          '<td class="border border-[#DCE5E1] px-2.5 py-1 text-center font-semibold text-[#112A22]">' +
          D.escapeHtml(rec.predikat || '-') +
          '</td></tr>'
        );
      })
      .join('');

    var studentControlsHtml = isWali
      ? '<div><div class="text-xs font-semibold text-[#5E756D]">Rapor Putra/Putri Anda</div>' +
        '<div class="mt-1 text-sm font-bold text-[#112A22]">' +
        D.escapeHtml(student.nama) +
        ' · Kelas ' +
        D.escapeHtml(student.kelas) +
        '</div></div>'
      : '<div><label class="block text-xs font-semibold text-[#5E756D]">Filter Kelas</label>' +
        '<select id="rapor-class-select" class="mt-1 min-h-[40px] rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm font-medium text-[#112A22]">' +
        '<option value="Semua"' +
        (raporState.classFilter === 'Semua' ? ' selected' : '') +
        '>Semua Kelas</option>' +
        store.classes
          .map(function (c) {
            return (
              '<option value="' +
              D.escapeHtml(c.nama) +
              '"' +
              (raporState.classFilter === c.nama ? ' selected' : '') +
              '>Kelas ' +
              D.escapeHtml(c.nama) +
              '</option>'
            );
          })
          .join('') +
        '</select></div>' +
        '<div><label class="block text-xs font-semibold text-[#5E756D]">Pilih Siswa (' +
        selectableStudents.length +
        ')</label>' +
        '<select id="rapor-student-select" class="mt-1 min-h-[40px] max-w-xs rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm font-medium text-[#112A22]">' +
        selectableStudents
          .map(function (s) {
            return (
              '<option value="' +
              D.escapeHtml(s.id) +
              '"' +
              (s.id === student.id ? ' selected' : '') +
              '>' +
              D.escapeHtml(s.nama) +
              ' — Kelas ' +
              D.escapeHtml(s.kelas) +
              '</option>'
            );
          })
          .join('') +
        '</select></div>';

    var noteSectionHtml = isWali
      ? '<section class="mt-4 print-break-inside-avoid">' +
        '<h3 class="text-xs font-bold text-[#0D7A5F]">E. CATATAN KHUSUS GURU PEMBIMBING / WALI KELAS</h3>' +
        '<div class="mt-1.5 min-h-[54px] rounded-lg border border-[#DCE5E1] px-3 py-2 text-xs leading-relaxed text-[#112A22]">' +
        D.escapeHtml(currentNote.trim() || defaultNoteFallback) +
        '</div></section>'
      : '<section class="mt-4 print-break-inside-avoid">' +
        '<div class="flex items-center justify-between"><h3 class="text-xs font-bold text-[#0D7A5F]">E. CATATAN KHUSUS GURU PEMBIMBING / WALI KELAS</h3>' +
        '<span class="no-print text-[11px] text-[#5E756D]">Ketik catatan untuk otomatis tersimpan ke rapor</span></div>' +
        '<textarea id="rapor-note-textarea" rows="3" placeholder="Tuliskan catatan perkembangan bacaan, adab, serta pesan murajaah..." class="no-print mt-1.5 w-full rounded-lg border border-[#D4DFDA] p-3 text-xs leading-relaxed text-[#112A22]">' +
        D.escapeHtml(currentNote) +
        '</textarea>' +
        '<div id="rapor-note-print" class="hidden print-only-block mt-1.5 min-h-[54px] rounded-lg border border-[#DCE5E1] px-3 py-2 text-xs leading-relaxed text-[#112A22]">' +
        D.escapeHtml(currentNote.trim() || defaultNoteFallback) +
        '</div></section>';

    container.innerHTML =
      '<div class="space-y-6">' +
      '<div class="no-print flex flex-col gap-4 rounded-xl border border-[#DCE5E1] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">' +
      '<div class="flex flex-col gap-3 sm:flex-row sm:items-center">' +
      studentControlsHtml +
      '<div><label class="block text-xs font-semibold text-[#5E756D]">Semester</label>' +
      '<select id="rapor-semester-select" class="mt-1 min-h-[40px] rounded-lg border border-[#D4DFDA] bg-white px-3 text-sm font-medium text-[#112A22]">' +
      '<option value="Ganjil"' +
      (semester === 'Ganjil' ? ' selected' : '') +
      '>Ganjil (' +
      D.escapeHtml(store.settings.tahunAjaran) +
      ')</option>' +
      '<option value="Genap"' +
      (semester === 'Genap' ? ' selected' : '') +
      '>Genap (' +
      D.escapeHtml(store.settings.tahunAjaran) +
      ')</option></select></div></div>' +
      '<div class="flex flex-col items-stretch gap-1.5 sm:items-end">' +
      '<button type="button" id="rapor-print-btn" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0D7A5F] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#09624C] whitespace-nowrap shrink-0">Cetak / Unduh PDF (A4)</button>' +
      '<span class="text-[11px] text-[#5E756D]">Pilih "Save as PDF" pada dialog cetak · Kertas A4 Portrait</span></div></div>' +
      // Lembar Rapor A4
      '<article class="print-sheet mx-auto max-w-[210mm] rounded-xl border border-[#DCE5E1] bg-white p-6 shadow-xs sm:p-10">' +
      '<header class="border-b-2 border-[#0D7A5F] pb-3.5">' +
      '<div class="flex items-center justify-between gap-4">' +
      '<div class="flex items-center gap-3.5">' +
      '<svg viewBox="0 0 48 48" class="h-12 w-12 shrink-0 text-[#0D7A5F]" fill="none" aria-hidden="true">' +
      '<rect x="10" y="10" width="28" height="28" stroke="currentColor" stroke-width="2" />' +
      '<rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)" stroke="#B78628" stroke-width="1.8" />' +
      '<circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="1.8" /></svg>' +
      '<div><div class="text-xs font-semibold tracking-wide text-[#0D7A5F]">RAPOR NGAJI MADRASAH IBTIDAIYAH DARUL ULUM CILACAP</div>' +
      '<h1 class="text-lg font-bold tracking-tight text-[#112A22] sm:text-xl">' +
      D.escapeHtml(store.settings.namaMadrasah || 'Madrasah Ibtidaiyah Darul Ulum Cilacap') +
      '</h1><p class="text-xs text-[#4D645C]">' +
      D.escapeHtml(store.settings.alamatMadrasah || 'Cilacap') +
      '</p></div></div>' +
      '<div class="hidden text-right sm:block print:block"><div class="text-xs font-semibold text-[#112A22]">RAPOR SEMESTER</div>' +
      '<div class="font-mono text-xs text-[#4D645C] tabular-nums">' +
      D.escapeHtml(semester) +
      ' · ' +
      D.escapeHtml(store.settings.tahunAjaran) +
      '</div></div></div><div class="mt-2 h-0.5 w-full bg-[#B78628]"></div></header>' +
      '<div class="mt-4 text-center"><h2 class="text-sm font-bold tracking-wide text-[#112A22] sm:text-base">LAPORAN HASIL BELAJAR NGAJI HARIAN (SENIN &amp; KAMIS BA\'DA DZUHUR)</h2></div>' +
      '<section class="mt-4 grid grid-cols-1 gap-x-8 gap-y-1.5 rounded-lg border border-[#DCE5E1] bg-[#FAFDFC] px-4 py-3 text-xs sm:grid-cols-2 print:grid-cols-2">' +
      '<div class="flex justify-between gap-2 py-0.5"><span class="text-[#5E756D]">Nama Siswa</span><span class="font-semibold text-[#112A22]">' +
      D.escapeHtml(student.nama) +
      '</span></div>' +
      '<div class="flex justify-between gap-2 py-0.5"><span class="text-[#5E756D]">Kelas</span><span class="font-mono font-semibold text-[#112A22]">' +
      D.escapeHtml(student.kelas) +
      '</span></div>' +
      '<div class="flex justify-between gap-2 py-0.5"><span class="text-[#5E756D]">NISN</span><span class="font-mono font-semibold text-[#112A22] tabular-nums">' +
      D.escapeHtml(student.nisn) +
      '</span></div>' +
      '<div class="flex justify-between gap-2 py-0.5"><span class="text-[#5E756D]">Semester / T.A.</span><span class="font-semibold text-[#112A22]">' +
      D.escapeHtml(semester) +
      ' / ' +
      D.escapeHtml(store.settings.tahunAjaran) +
      '</span></div>' +
      '<div class="flex justify-between gap-2 py-0.5"><span class="text-[#5E756D]">Guru Pembimbing</span><span class="font-semibold text-[#112A22]">' +
      D.escapeHtml(student.guruPembimbing) +
      '</span></div>' +
      '<div class="flex justify-between gap-2 py-0.5"><span class="text-[#5E756D]">Orang Tua / Wali</span><span class="font-semibold text-[#112A22]">' +
      D.escapeHtml(student.namaWali) +
      '</span></div></section>' +
      '<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2 print-break-inside-avoid">' +
      '<section class="rounded-lg border border-[#DCE5E1] p-3.5">' +
      '<h3 class="text-xs font-bold text-[#0D7A5F]">A. REKAP KEHADIRAN (SENIN &amp; KAMIS BA\'DA DZUHUR)</h3>' +
      '<table class="mt-2 w-full text-xs"><thead><tr class="border-b border-[#DCE5E1] text-[#556D65]"><th class="py-1 text-left font-semibold">Keterangan</th><th class="py-1 text-right font-semibold">Jumlah</th></tr></thead>' +
      '<tbody class="divide-y divide-[#EDF2F0]">' +
      '<tr><td class="py-1 text-[#2A423A]">Hadir Mengikuti Sesi</td><td class="py-1 text-right font-mono font-semibold text-[#0D7A5F] tabular-nums">' +
      hadirSes +
      ' sesi</td></tr>' +
      '<tr><td class="py-1 text-[#2A423A]">Izin</td><td class="py-1 text-right font-mono text-[#112A22] tabular-nums">' +
      izinSes +
      ' sesi</td></tr>' +
      '<tr><td class="py-1 text-[#2A423A]">Sakit</td><td class="py-1 text-right font-mono text-[#112A22] tabular-nums">' +
      sakitSes +
      ' sesi</td></tr>' +
      '<tr><td class="py-1 text-[#2A423A]">Tanpa Keterangan (Alfa)</td><td class="py-1 text-right font-mono text-[#112A22] tabular-nums">' +
      alfaSes +
      ' sesi</td></tr>' +
      '<tr class="bg-[#FAFDFC] font-semibold"><td class="py-1.5 text-[#112A22]">Persentase Kehadiran</td><td class="py-1.5 text-right font-mono text-[#112A22] tabular-nums">' +
      pctSes +
      '% (' +
      hadirSes +
      '/' +
      totalSes +
      ')</td></tr></tbody></table></section>' +
      '<section class="rounded-lg border border-[#DCE5E1] p-3.5">' +
      '<h3 class="text-xs font-bold text-[#0D7A5F]">B. CAPAIAN AKHIR BACAAN (IQRO / AL-QUR\'AN)</h3>' +
      '<div class="mt-2 space-y-2 text-xs">' +
      '<div class="flex justify-between gap-2 border-b border-[#EDF2F0] pb-1.5"><span class="text-[#5E756D]">Posisi Awal Semester</span><span class="text-right font-medium text-[#2A423A]">' +
      (firstRead && firstRead.bacaan ? D.escapeHtml(D.formatReadingSummary(firstRead.bacaan)) : 'Belum tercatat') +
      '</span></div>' +
      '<div class="flex justify-between gap-2 border-b border-[#EDF2F0] pb-1.5"><span class="text-[#5E756D]">Capaian Akhir Semester</span><span class="text-right font-bold text-[#112A22]">' +
      (lastRead && lastRead.bacaan ? D.escapeHtml(D.formatReadingSummary(lastRead.bacaan)) : 'Belum tercatat') +
      '</span></div>' +
      '<div class="flex justify-between gap-2 border-b border-[#EDF2F0] pb-1.5"><span class="text-[#5E756D]">Nilai Kelancaran &amp; Tajwid</span><span class="text-right font-semibold text-[#0D7A5F]">' +
      (lastRead && lastRead.bacaan ? D.escapeHtml(lastRead.bacaan.kelancaran) : '-') +
      '</span></div>' +
      '<div class="flex justify-between gap-2"><span class="text-[#5E756D]">Total Setoran Bacaan</span><span class="font-mono font-semibold text-[#112A22] tabular-nums">' +
      readSessions.length +
      ' kali setor</span></div></div></section></div>' +
      '<section class="mt-4 print-break-inside-avoid">' +
      '<div class="flex items-center justify-between"><h3 class="text-xs font-bold text-[#0D7A5F]">C. REKAPITULASI HAFALAN JUZ 30 (SURAT AN-NABA\' S.D. AN-NAS)</h3>' +
      '<span class="font-mono text-xs font-semibold text-[#112A22] tabular-nums">Tuntas: ' +
      tahfidz.juz30CompletedCount +
      ' / 37 Surat</span></div>' +
      '<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 print:grid-cols-3">' +
      juz30TablesHtml +
      '</div></section>' +
      '<section class="mt-4 print-break-inside-avoid">' +
      '<div class="flex items-center justify-between"><h3 class="text-xs font-bold text-[#B78628]">D. REKAPITULASI HAFALAN 5 SURAT PILIHAN UTAMA (LANJUTAN PASCA JUZ 30)</h3>' +
      '<span class="font-mono text-xs font-semibold text-[#112A22] tabular-nums">' +
      (tahfidz.isJuz30Complete
        ? 'Tuntas: ' + tahfidz.pilihanCompletedCount + ' / 5 Surat'
        : 'Menunggu Juz 30 Tuntas') +
      '</span></div>' +
      '<table class="mt-2 w-full border-collapse border border-[#DCE5E1] text-xs"><thead><tr class="bg-[#FAF8F2] text-[#2A423A]">' +
      '<th class="w-10 border border-[#DCE5E1] px-2.5 py-1.5 text-center font-semibold">No</th>' +
      '<th class="border border-[#DCE5E1] px-2.5 py-1.5 text-left font-semibold">Nama Surat Pilihan</th>' +
      '<th class="border border-[#DCE5E1] px-2.5 py-1.5 text-center font-semibold">Jumlah Ayat</th>' +
      '<th class="border border-[#DCE5E1] px-2.5 py-1.5 text-center font-semibold">Capaian Ayat</th>' +
      '<th class="border border-[#DCE5E1] px-2.5 py-1.5 text-center font-semibold">Status</th>' +
      '<th class="border border-[#DCE5E1] px-2.5 py-1.5 text-center font-semibold">Predikat Nilai</th>' +
      '</tr></thead><tbody>' +
      pilihanRowsHtml +
      '</tbody></table></section>' +
      noteSectionHtml +
      '<footer class="mt-6 grid grid-cols-3 gap-4 pt-2 text-center text-xs text-[#112A22] print-break-inside-avoid">' +
      '<div class="flex flex-col justify-between"><div><p class="text-[#4D645C]">Mengetahui,</p><p class="font-semibold">Orang Tua / Wali Murid</p></div>' +
      '<div class="mt-14"><p class="font-semibold underline underline-offset-4">' +
      D.escapeHtml(student.namaWali && student.namaWali !== '-' ? student.namaWali : '........................') +
      '</p></div></div>' +
      '<div class="flex flex-col justify-between"><div><p class="text-[#4D645C]">Mengetahui,</p><p class="font-semibold">Kepala Madrasah</p></div>' +
      '<div class="mt-14"><p class="font-semibold underline underline-offset-4">' +
      D.escapeHtml(store.settings.namaKepalaMadrasah || '........................') +
      '</p><p class="mt-0.5 font-mono text-[10px] text-[#4D645C]">NIP. ' +
      D.escapeHtml(store.settings.nipKepalaMadrasah || '-') +
      '</p></div></div>' +
      '<div class="flex flex-col justify-between"><div><p class="text-[#4D645C]">' +
      D.escapeHtml(
        ((store.settings.kotaRapor || 'Cilacap') + ', ') +
          (store.settings.tanggalRapor
            ? D.formatTanggalIndo(store.settings.tanggalRapor, false)
            : D.formatTanggalIndo(D.toDateInputString(new Date()), false))
      ) +
      '</p><p class="font-semibold">Guru Pembimbing Roodoh</p></div>' +
      '<div class="mt-14"><p class="font-semibold underline underline-offset-4">' +
      D.escapeHtml(student.guruPembimbing || '........................') +
      '</p></div></div></footer>' +
      '</article></div>';

    var clsSel = document.getElementById('rapor-class-select');
    if (clsSel) {
      clsSel.onchange = function (e) {
        raporState.classFilter = e.target.value;
        raporState.studentId = '';
        renderReport();
      };
    }
    var stuSel = document.getElementById('rapor-student-select');
    if (stuSel) {
      stuSel.onchange = function (e) {
        raporState.studentId = e.target.value;
        renderReport(e.target.value);
      };
    }
    document.getElementById('rapor-semester-select').onchange = function (e) {
      raporState.semester = e.target.value;
      renderReport();
    };
    document.getElementById('rapor-print-btn').onclick = function () {
      window.print();
    };
    var noteArea = document.getElementById('rapor-note-textarea');
    if (noteArea) {
      noteArea.oninput = function (e) {
        var val = e.target.value;
        D.updateStudentSemesterNote(student.id, semesterKey, val);
        var printBox = document.getElementById('rapor-note-print');
        if (printBox) {
          printBox.textContent = val.trim() || defaultNoteFallback;
        }
      };
    }
  }

  global.RoodohRapor = {
    renderReport: renderReport,
  };
})(window);
