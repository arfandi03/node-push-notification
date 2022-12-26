console.log('Service worker loaded...');

self.addEventListener('push', e => {
    const data = e.data.json();

    console.log('Push recieved...');

    self.registration.showNotification(data.title, {
        body: 'Notified by server',
        icon: 'https://icons8.com/icon/77240/gear'
    });
})