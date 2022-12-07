function checkIfConnected() {
    if (firebase.auth().currentUser === null || firebase.auth().currentUser.isAnonymous) {
        let response = AuthResponse.Error("Not connected")
        returnAuthResponse(response);
        return;
    }
    
    returnIdToken();
}

function signInWithGoogle() {
    let provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            returnIdToken()
        }).catch((error) => {
            let response = AuthResponse.Error(error)
            returnAuthResponse(response);
    });
}

function signInAnonymously() {
    firebase.auth().signInAnonymously()
        .then(() => {
            returnIdToken()
        })
        .catch((error) => {
            let response = AuthResponse.Error(error)
            returnAuthResponse(response);
        });
}

/**
 Used from PC only
 */
function firebaseLogin(providerName) {
    let provider = getProvider(providerName);
    firebase.auth().useDeviceLanguage();
    firebase.auth().signInWithRedirect(provider);
}

// This is being called directly from unity. 
function signOut() {
    let response;
    firebase.auth().signOut().then(() => {
        response = AuthResponse.Success("loggedOut")
    }).catch((error) => {
        response = AuthResponse.Error(error)
    }).finally(() => {
        returnAuthResponse(response);
    });
}

function getProvider(providerName) {
    if (providerName && providerName.indexOf("facebook") !== -1)
        return new firebase.auth.FacebookAuthProvider()
    else
        return new firebase.auth.GoogleAuthProvider()
}

function returnIdToken() {
    let response;

    firebase.auth().currentUser.getIdToken(true)
        .then((token) => {
            response = AuthResponse.Success(token)
        })
        .catch(function (error) {
            response = AuthResponse.Error(error)

        }).finally(() => {
        returnAuthResponse(response);
    });
}


function returnAuthResponse(response) {
    window.unityInstance.SendMessage('PersistantObjects', 'OnGotWebResponse', JSON.stringify(response));
}

class AuthResponse {
    constructor(taskResult, response) {
        this.Result = taskResult === undefined ? "" : taskResult;
        this.Response = response === undefined ? "" : response;
    }

    static Success(token) {
        return new AuthResponse(AuthTaskResult.Success, token)
    }

    static Cancelled() {
        return new AuthResponse(AuthTaskResult.Cancelled, "Cancelled")
    }

    static Error(error) {
        return new AuthResponse(AuthTaskResult.Error, error)
    }
}

class AuthTaskResult {
    static Success = "Success"
    static Cancelled = "Cancelled"
    static Error = "Error"
}