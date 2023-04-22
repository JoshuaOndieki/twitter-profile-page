class App{

    constructor() {
        this.usersUrl = 'https://jsonplaceholder.typicode.com/users'
        this.postsUrl = 'https://jsonplaceholder.typicode.com/posts'

        // when constructing, get the tweet container and reuse it as a template
        this.tweetsContainerTemplate = document.getElementById('tweet-template').cloneNode(true)
        // tweetsContainerTemplate = tweetsContainerTemplate.cloneNode(true)
    }

    renderApp(options) {
        this.renderUser(options.userId)
        this.renderPosts(options.userId)
    }

    async getUser(userId) {
        let userResponse = await fetch(this.usersUrl + '/' + userId)
        let userData = await userResponse.json()
        return userData
    }

    async getPostsByUserId(userId) {{
        let postsResponse = await fetch(this.postsUrl + '?userId=' + userId)
        let postsData = await postsResponse.json()
        return postsData
    }}

    async renderUser(userId) {
        let userData = await this.getUser(userId)
        this.userData = userData
        let elements = this.getProfileElements()

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

    async renderPosts(userId) {
        let posts = await this.getPostsByUserId(userId)
        let userData = await this.getUser(userId)
        let tweetsElement = document.getElementById('tweets')
        tweetsElement.innerHTML = ""
        posts.map(post => {
            let tweetElement = this.tweetsContainerTemplate.cloneNode(true);
            let tweetContentElement = tweetElement.getElementsByClassName('tweet-content')[0]
            tweetContentElement.innerHTML = `<span>${post.title}</span> ${post.body}`
            tweetElement.id = post.userId + '-' + post.id
            tweetElement.getElementsByClassName('tweet-tweeter-name')[0].innerHTML = userData.name
            let tweeterUsernameElement = tweetElement.getElementsByClassName('tweet-tweeter-username')[0]
            tweeterUsernameElement.innerHTML = '@' + userData.username
            tweeterUsernameElement.classList.add('gray-font-color')

            let tweetTimestampElement = tweetElement.getElementsByClassName('tweet-timestamp')[0]
            tweetTimestampElement.innerHTML = 'Apr 21'
            tweetTimestampElement.classList.add('gray-font-color')

            let tweeterProfilePicElement = tweetElement.getElementsByClassName('tweeter-profile-pic')[0].getElementsByTagName('img')[0]
            tweeterProfilePicElement.setAttribute('src', 'assets/baby-yoda-grogu.gif')

            tweetsElement.appendChild(tweetElement)
        })
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
        return svg;
    }
}


const myApp = new App()

myApp.renderApp({userId:7})
