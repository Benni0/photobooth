/* eslint n/no-unsupported-features/node-builtins: "off" */
/* globals photoboothTools shellCommand */
$(function () {
    $('#reset-btn').on('click', function (e) {
        e.preventDefault();
        const msg = photoboothTools.getTranslation('really_delete');
        const really = confirm(msg);
        const elem = $(this);
        elem.addClass('saving');
        if (really) {
            // show loader
            $('.pageLoader').addClass('isActive');
            $('.pageLoader').find('label').html(photoboothTools.getTranslation('saving'));

            const data = new FormData(document.querySelector('form'));
            data.append('type', 'reset');

            fetch('../api/admin.php', {
                method: 'POST',
                body: data
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.status === 'success') {
                        window.location.reload();
                    } else {
                        photoboothTools.console.logDev(data.message);
                        window.location.reload();
                    }
                })
                .catch((error) => {
                    photoboothTools.console.logDev('Error:', error);
                });
        } else {
            elem.removeClass('saving');
        }
    });

    $('#save-admin-btn').on('click', function (e) {
        e.preventDefault();

        // show loader
        $('.pageLoader').addClass('isActive');
        $('.pageLoader').find('label').html(photoboothTools.getTranslation('saving'));

        const data = new FormData(document.querySelector('form'));
        data.append('type', 'config');

        fetch('../api/admin.php', {
            method: 'POST',
            body: data
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    window.location.reload();
                } else {
                    photoboothTools.console.logDev(data.message);
                    window.location.reload();
                }
            })
            .catch((error) => {
                photoboothTools.console.logDev('Error:', error);
            });
    });

    $('#test-connection').on('click', function (e) {
        e.preventDefault();
        const elem = $(this);

        // show loader
        $('.pageLoader').addClass('isActive');
        $('.pageLoader').find('label').html(photoboothTools.getTranslation('checking'));

        $.ajax({
            url: '../api/testFtpConnection.php',
            dataType: 'json',
            data: $('form').serialize(),
            type: 'post',
            success: (resp) => {
                photoboothTools.console.log('resp', resp);

                resp.missing.forEach((el) => {
                    photoboothTools.console.log(el);
                    $('#ftp\\:' + el).addClass('required');
                });
                alert(photoboothTools.getTranslation(resp.message));
            },

            error: (jqXHR) => {
                photoboothTools.console.log('Error checking FTP connection: ', jqXHR.responseText);
            },

            complete: (jqXHR, textStatus) => {
                const status = jqXHR.status;
                let classes = 'isActive isSuccess';
                let findClasses = '.success span';
                if (status != 200 || jqXHR.responseJSON.response != 'success' || textStatus != 'success') {
                    classes = 'isActive isError';
                    findClasses = '.error span';
                }

                $('.pageLoader').removeClass('isActive');
                $('.adminToast').addClass(classes);
                const msg = elem.find(findClasses).html();
                $('.adminToast').find('.headline').html(msg);

                setTimeout(function () {
                    $('.adminToast').removeClass('isActive');
                }, 2000);
            }
        });
    });

    $('#diskusage-btn').on('click', function (e) {
        e.preventDefault();
        location.assign('../admin/diskusage');

        return false;
    });

    $('#databaserebuild-btn').on('click', function (e) {
        e.preventDefault();
        const elem = $(this);

        // show loader
        $('.pageLoader').addClass('isActive');
        $('.pageLoader').find('label').html(photoboothTools.getTranslation('busy'));

        $.ajax({
            url: '../api/rebuildImageDB.php',
            // eslint-disable-next-line no-unused-vars
            success: function (resp) {
                $('.pageLoader').removeClass('isActive');
                $('.adminToast').addClass('isActive isSuccess');
                const msg = elem.find('.success span').html();
                $('.adminToast').find('.headline').html(msg);

                setTimeout(function () {
                    $('.adminToast').removeClass('isActive');
                }, 3000);
            }
        });
    });

    $('#checkversion-btn').on('click', function (ev) {
        ev.preventDefault();
        const elem = $(this);

        // show loader
        $('.pageLoader').addClass('isActive');
        $('.pageLoader').find('label').html(photoboothTools.getTranslation('checking'));

        $.ajax({
            url: '../api/checkVersion.php',
            method: 'GET',
            success: (data) => {
                $('#checkVersion').empty();
                photoboothTools.console.log('data', data);
                if (!data.updateAvailable) {
                    $('#current_version_text').text(photoboothTools.getTranslation('using_latest_version'));
                } else if (/^\d+\.\d+\.\d+$/u.test(data.availableVersion)) {
                    $('#current_version_text').text(photoboothTools.getTranslation('current_version'));
                    $('#current_version').text(data.currentVersion);
                    $('#available_version_text').text(photoboothTools.getTranslation('available_version'));
                    $('#available_version').text(data.availableVersion);
                } else {
                    $('#current_version_text').text(photoboothTools.getTranslation('test_update_available'));
                }

                $('.pageLoader').removeClass('isActive');
                $('.adminToast').addClass('isActive isSuccess');
                const msg = elem.find('.success span').html();
                $('.adminToast').find('.headline').html(msg);

                setTimeout(function () {
                    $('.adminToast').removeClass('isActive');
                }, 2000);
            },

            error: (jqXHR) => {
                photoboothTools.console.log('Error checking Version: ', jqXHR.responseText);

                $('.pageLoader').removeClass('isActive');
                $('.adminToast').addClass('isActive isError');
                const msg = elem.find('.error span').html();
                $('.adminToast').find('.headline').html(msg);

                setTimeout(function () {
                    $('.adminToast').removeClass('isActive');
                }, 2000);
            }
        });
    });

    $('#reset-print-lock-btn').on('click', function (e) {
        e.preventDefault();
        const elem = $(this);

        // show loader
        $('.pageLoader').addClass('isActive');
        $('.pageLoader').find('label').html(photoboothTools.getTranslation('busy'));

        $.ajax({
            method: 'GET',
            url: '../api/printDB.php',
            data: {
                action: 'unlockPrint'
            },
            success: (data) => {
                $('.pageLoader').removeClass('isActive');
                if (data.success) {
                    $('.adminToast').addClass('isActive isSuccess');
                    const msg = elem.find('.success span').html();
                    $('.adminToast').find('.headline').html(msg);
                } else {
                    $('.adminToast').addClass('isActive isError');
                    const msg = elem.find('.error span').html();
                    $('.adminToast').find('.headline').html(msg);
                }
                setTimeout(function () {
                    $('.adminToast').removeClass('isActive');
                }, 2000);
            }
        });
    });

    $('#soundtest-btn').on('click', function (ev) {
        ev.preventDefault();

        let audioElement = document.getElementById('testaudio');
        if (audioElement === null) {
            audioElement = document.createElement('audio');
            audioElement.id = 'testaudio';
            document.body.append(audioElement);
        }

        let soundfile = null;
        if ($('[name="sound[voice]"]').val() === 'custom') {
            soundfile =
                '/private/sounds/' +
                $('[name="sound[voice]"]').val() +
                '/counter-' +
                Math.floor(Math.random() * 10 + 1) +
                '.mp3';
        } else {
            soundfile =
                '/resources/sounds/' +
                $('[name="sound[voice]"]').val() +
                '/' +
                $('[name="ui[language]"]').val() +
                '/counter-' +
                Math.floor(Math.random() * 10 + 1) +
                '.mp3';
        }
        audioElement.src = soundfile;
        audioElement.play().catch((error) => {
            photoboothTools.console.log('Error with audio.play: ' + error);
        });
        return false;
    });

    $('#debugpanel-btn').on('click', function (ev) {
        ev.preventDefault();
        window.open('../admin/debug');

        return false;
    });

    $('#translate-btn').on('click', function (ev) {
        ev.preventDefault();
        window.open('https://crowdin.com/project/photobooth');

        return false;
    });

    $('#filesupload-btn').on('click', function (ev) {
        ev.preventDefault();
        window.open('../admin/upload');

        return false;
    });

    $('#reboot-btn').on('click', function (ev) {
        ev.preventDefault();
        shellCommand('reboot');

        return false;
    });

    $('#shutdown-btn').on('click', function (ev) {
        ev.preventDefault();
        shellCommand('shutdown');

        return false;
    });
});
