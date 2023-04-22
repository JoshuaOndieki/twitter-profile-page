class App{

    constructor() {
        this.usersUrl = 'https://jsonplaceholder.typicode.com/users'
        this.postsUrl = 'https://jsonplaceholder.typicode.com/posts'
    }

    async getUser(userId) {
        let userResponse = await fetch(this.usersUrl + '/' + userId)
        let userData = await userResponse.json()
        return userData
    }

    async renderUser(userId) {
        let userData = await this.getUser(userId)
        console.log(userData)
        let elements = this.getProfileElements()
        console.log(elements);

        elements.profileNameElements.map(element => {
            element.innerHTML = userData.name
        })

        elements.profileTweetsCountElement.innerHTML = ( +userData.address.suite.slice(-3) / 10).toFixed(1).replace(/\.0+$/, '') + 'k Tweets';

        elements.profileUsernameElement.innerHTML = '@' + userData.username

        elements.profilePicImgElement.setAttribute('src', 'assets/baby-yoda-grogu.gif')
        elements.profileCoverImgElement.setAttribute('src', 'assets/futurama-bender.gif')

        let profileDescriptionHTML = elements.profileDescriptionElement.innerHTML
        profileDescriptionHTML += '<br>' + userData.company.catchPhrase + '<br>' + userData.company.bs

        elements.profileDescriptionElement.innerHTML = profileDescriptionHTML

        // For DEMO purposes, use the first part of the zipcode for followers, and the other part for following.
        let splitZipCode = userData.address.zipcode.split('-')
        if (splitZipCode.length == 2) {
            let followers = +splitZipCode[1]
            elements.profileFollowingElement.innerHTML = followers.toLocaleString()
        } else {
            elements.profileFollowingElement.innerHTML = '0'
        }
        elements.profileFollowersElement.innerHTML = (+splitZipCode[0] / 1000).toFixed(1) + 'k'


        // add link
        let link = await this.createProfileMetaNode({
            id: 'profile-meta-link',
            url: 'assets/link.svg',
            type: 'link',
            text: userData.website,
            link: userData.website
        })
        elements.profileMetaElement.insertBefore(link, elements.profileMetaElement.lastElementChild)

        // add location
        let location = await this.createProfileMetaNode({
            id: 'profile-meta-location',
            url: 'assets/location.svg',
            type: 'location',
            text: userData.address.city,
        })
        elements.profileMetaElement.insertBefore(location, elements.profileMetaElement.lastElementChild)

        // add proffesion
        let profession = await this.createProfileMetaNode({
            id: 'profile-meta-profession',
            url: 'assets/profession.svg',
            type: 'profession',
            text: userData.company.name,
        })
        elements.profileMetaElement.insertBefore(profession, elements.profileMetaElement.lastElementChild)

    }

    getProfileElements() {
        let profileNameElements = Array.from(document.getElementsByClassName('profile-name'))
        let profileUsernameElement = document.getElementById('profile-username')
        let profilePicImgElement = document.getElementById('profile-pic').getElementsByTagName('img')[0]
        let profileCoverImgElement = document.getElementById('profile-cover-img').getElementsByTagName('img')[0]
        let profileFollowingElement = document.getElementById('profile-following')
        let profileFollowersElement = document.getElementById('profile-followers')
        let profileTweetsCountElement = document.getElementById('tweets-count')
        let profileMetaElement = document.getElementById('profile-meta')
        let profileDescriptionElement = document.getElementById('profile-description')

        return {
            profileNameElements,
            profileUsernameElement,
            profilePicImgElement,
            profileCoverImgElement,
            profileFollowingElement,
            profileFollowersElement,
            profileTweetsCountElement,
            profileMetaElement,
            profileDescriptionElement
        }
    }

    async createProfileMetaNode(meta) {
        let metaNode = document.createElement('div')
        metaNode.classList.add('profile-meta-data')
        metaNode.id = meta.id

        let metaSvg = await this.getSvg(meta.url)
        metaNode.appendChild(metaSvg)
        let profileMetaText = document.createElement('div')
        if (meta.type == 'link') {
            profileMetaText.innerHTML = `<a href="${meta.link}" target="_blank">${meta.text}</a>`
        } else {
            profileMetaText.innerHTML = meta.text
        }
        metaNode.appendChild(profileMetaText)

        return metaNode
    }

    async getSvg(url) {
        let response = await fetch(url)
        let data = await response.text()
        const parser = new DOMParser();
        const svg = parser.parseFromString(data, 'image/svg+xml').querySelector('svg');
        console.log(svg)
        return svg;
    }
}


const myApp = new App()

myApp.renderUser(7)
