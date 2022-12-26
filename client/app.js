const publicVapidKey = 'BPJzMyhMPvX59eUJb_CDePER0KnIia6uJ_0mGWl6SMwmQLtuik2v_JUeph4hYrVECL5OVGwXZLYWOVo4Mg82IAw';

if('serviceWorker' in navigator) {
    send().catch(err => console.log(err));
}

// Copied from the web-push documentation
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

// register service worker, register push, send push
async function send() {
    console.log('Register service worker...');

    const register = await navigator.serviceWorker.register('/worker.js', {
        scope: '/'
    });

    console.log('Service worker registered...');

    console.log('register push...');

    const subcription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })

    console.log('Push registered...');

    console.log('Sending push...');

    await fetch('/subcription', {
        method: 'POST',
        body: JSON.stringify(subcription),
        headers: {
            'content-type': 'application/json'
        }
    });

    console.log('Push sent...');

}

window.broadcast = async () => {
    await fetch('/broadcast', {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
        }
    });
}