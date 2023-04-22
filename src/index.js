class App{

    constructor() {
        this.usersUrl = 'https://jsonplaceholder.typicode.com/users'
        this.postsUrl = 'https://jsonplaceholder.typicode.com/posts'
        this.commentsUrl = 'https://jsonplaceholder.typicode.com/comments'

        // when constructing, get the container and tweet container and reuse it as a template
        this.containerTemplate = document.getElementById('container').cloneNode(true)
        this.setBackButtonOnClick()
        this.tweetsContainerTemplate = document.getElementById('tweet-template').cloneNode(true)
    }

    renderApp(options) {
        document.getElementById('container').remove()
        document.getElementsByTagName('body')[0].appendChild(this.containerTemplate.cloneNode(true))
        this.currentUser = options.userId
        this.renderUser(options.userId)
        this.renderPosts(options.userId)
    }

    setBackButtonOnClick() {
        let backButtonElement = document.getElementsByClassName('back-svg')[0]
        backButtonElement.addEventListener('click', () => {
            this.renderApp({userId: this.currentUser})
            window.scrollTo(0,0)
        })
    }

    async getUser(userId) {
        return await this.getData(this.usersUrl + '/' + userId)
    }

    async getPostsByUserId(userId) {{
        return await this.getData(this.postsUrl + '?userId=' + userId)
    }}

    async getData(url) {
        let response = await fetch(url)
        let data = await response.json()
        return data
    }

    async getCommentsByPost(postId) {
        let commentsReponse = await fetch(this.commentsUrl + `/?postId=${postId}`)
        let comments = await commentsReponse.json()
        return comments
    }

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
        if (splitZipCode.length === 2) {
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

    async renderPostsOrComments(data) {
        data.content.map(post => {
            let tweetElement = this.tweetsContainerTemplate.cloneNode(true);
            let tweetContentElement = tweetElement.getElementsByClassName('tweet-content')[0]
            if (data.type == 'post') {
                tweetContentElement.innerHTML = `<span>${post.title}</span> ${post.body}`
                tweetElement.id = post.userId + '-' + post.id
            } else {
                tweetContentElement.innerHTML = post.body
                tweetElement.id = post.postId + '-' + post.id}
            // user email to generate name and username for DEMO purposes
            let tweeterName;
            let username;
            if (data.type == 'comment') {
                tweeterName = post.email.split('@')[0]
                username = post.email.split('@')[1].split('.')[0]
            } else {
                tweeterName = data.userData.name
                username = data.userData.username}
            tweetElement.getElementsByClassName('tweet-tweeter-name')[0].innerHTML = tweeterName
            let tweeterUsernameElement = tweetElement.getElementsByClassName('tweet-tweeter-username')[0]
            tweeterUsernameElement.innerHTML = '@' + username
            tweeterUsernameElement.classList.add('gray-font-color')
            let tweetTimestampElement = tweetElement.getElementsByClassName('tweet-timestamp')[0]
            tweetTimestampElement.innerHTML = 'Apr 21'
            tweetTimestampElement.classList.add('gray-font-color')
            let tweeterProfilePicElement = tweetElement.getElementsByClassName('tweeter-profile-pic')[0].getElementsByTagName('img')[0]
            if (data.type == 'post') {
                tweeterProfilePicElement.setAttribute('src', 'assets/baby-yoda-grogu.gif')
                tweetElement.addEventListener('click', async () => {
                    let postElement = tweetElement.cloneNode(true)
                    await this.renderComments(post.id, postElement)
                    window.scrollTo(0,0)})
                }
            data.tweetsElement.appendChild(tweetElement)
        })}

    async renderPosts(userId) {
        let posts = await this.getPostsByUserId(userId)
        let userData = await this.getUser(userId)
        let tweetsElement = document.getElementById('tweets')
        tweetsElement.innerHTML = ""

        await this.renderPostsOrComments({tweetsElement, content: posts, type: 'post', userData})
    }

    async renderComments(postId, postElement) {
        // TO-DO: REFACTOR CODE!
        // edit header, remove profile cover, info, and nav, render only current post and then comments
        let comments = await this.getCommentsByPost(postId)
        let headerElement = document.getElementsByTagName('header')[0].cloneNode(true)
        let tweetsElement = document.getElementById('tweets').cloneNode(true)
        tweetsElement.style.borderTop = '1px solid var(--border-main-color)'
        tweetsElement.innerHTML = ''
        let containerElement = document.getElementById('container')
        containerElement.innerHTML = ''
        //rearrange tweet
        let profilePicElement = postElement.getElementsByClassName('tweeter-profile-pic')[0]
        let tweetInfoElement = postElement.getElementsByClassName('tweet-info')[0]
        profilePicElement.parentNode.removeChild(profilePicElement)
        tweetInfoElement.parentNode.removeChild(tweetInfoElement)

        let tweeterInfoElement = document.createElement('div')
        tweeterInfoElement.style.cssText = `display: flex; justify-content: center; align-items: center; gap: 1rem`
        tweetInfoElement.style.flex = 1
        tweeterInfoElement.append(profilePicElement, tweetInfoElement)

        postElement.getElementsByClassName('tweet')[0].insertBefore(tweeterInfoElement, postElement.getElementsByClassName('tweet')[0].firstElementChild)

        let tweetMetaElement = postElement.getElementsByClassName('tweet-meta')[0]
        let tweetTimestampElement = postElement.getElementsByClassName('tweet-timestamp')[0]
        tweetTimestampElement.parentNode.removeChild(tweetTimestampElement)

        let tweeterSpan = tweetMetaElement.getElementsByTagName('span')[0]
        tweeterSpan.parentNode.removeChild(tweeterSpan)

        postElement.getElementsByClassName('tweet')[0].style.cssText = `flex-direction: column;`
        postElement.getElementsByClassName('tweet')[0].classList.add('opened-tweet')

        let tweetTimeViewsElement = document.createElement('div')
        tweetTimeViewsElement.style.cssText = `padding: 1rem 0; display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-main-color)`
        tweetTimeViewsElement.classList.add('time-and-views')
        let dateTimeElement = document.createElement('span')
        dateTimeElement.classList.add('gray-font-color', 'timestamp')
        dateTimeElement.innerHTML = `4:20 PM `
        dateTimeElement.appendChild(tweeterSpan.cloneNode(true))
        dateTimeElement.innerHTML += ` APR 21, 2023`
        let viewsElement = document.createElement('span')
        viewsElement.innerHTML = `69k <span class="gray-font-color"> Views</span>`

        tweetTimeViewsElement.append(dateTimeElement, tweeterSpan.cloneNode(true), viewsElement)

        let tweetDetailsActionsElement = postElement.getElementsByClassName('tweet-details-and-actions')[0]
        tweetDetailsActionsElement.insertBefore(tweetTimeViewsElement, tweetDetailsActionsElement.lastElementChild)

        let actionsCounters = postElement.getElementsByClassName('action-counter')
        let countersElement = document.createElement('div')
        countersElement.style.cssText = `display: flex; gap: 0.5rem; padding: 1rem 0; border-bottom: 1px solid var(--border-main-color)`

        Array.from(actionsCounters).map(actionCounter => {
            actionCounter.parentNode.removeChild(actionCounter)
        })

        let retweetsCounterElement = document.createElement('div')
        retweetsCounterElement.innerHTML = `333 <span class="gray-font-color"> Retweets</span>`
        let quotesCounterElement = document.createElement('div')
        quotesCounterElement.innerHTML = `87 <span class="gray-font-color"> Quotes</span>`
        let likesCounterElement = document.createElement('div')
        likesCounterElement.innerHTML = `42k <span class="gray-font-color"> Likes</span>`
        let bookmarksCounterElement = document.createElement('div')
        bookmarksCounterElement.innerHTML = `1,991 <span class="gray-font-color"> Bookmarks</span>`

        Array.from([retweetsCounterElement, quotesCounterElement, likesCounterElement]).map(counterElement => {
            counterElement.classList.add('tweet-counter')
        })

        countersElement.append(retweetsCounterElement, quotesCounterElement, likesCounterElement, bookmarksCounterElement)

        tweetDetailsActionsElement.insertBefore(countersElement, tweetDetailsActionsElement.lastElementChild)

        // reply tweet form
        let replyTweetElement = document.createElement('div')
        replyTweetElement.style.cssText = `width: 100%; height: 60px; display: flex; align-items: center; gap: 0.5rem`

        let loggedUserPicElement = document.createElement('div')
        loggedUserPicElement.classList.add('logged-user-profile-pic', 'tweeter-profile-pic')
        loggedUserPicElement.innerHTML = `<img style="height: 50px" src="assets/twitter-logo-upside-down.jpg" alt="user pic">`
        replyTweetElement.appendChild(loggedUserPicElement)

        let replyTweetFormElement = document.createElement('form')
        replyTweetFormElement.setAttribute("method", "post");
        replyTweetFormElement.addEventListener('onsubmit', (e) => {
            e.preventDefault()
        })
        replyTweetFormElement.style.cssText = `display: flex; flex: 1; align-items: center; gap: 0.5rem`

        let replyTweetFormInputElement = document.createElement('input')
        replyTweetFormInputElement.setAttribute("type", "text");
        replyTweetFormInputElement.setAttribute("name", "tweet-reply");
        replyTweetFormInputElement.setAttribute('placeholder', 'Tweet your reply')
        replyTweetFormInputElement.style.cssText = `height: 50px; flex: 1; font-size: 1.5rem; border: none`

        let replyTweetFormSubmitElement = document.createElement('input')
        replyTweetFormSubmitElement.setAttribute("type", "submit");
        replyTweetFormSubmitElement.setAttribute("value", "Reply");
        replyTweetFormSubmitElement.style.cssText = `height: 40px; padding: 0 1.5rem; border: none; background-color: var(--blue-button-background); border-radius: 1.5rem; color: white`

        replyTweetFormElement.append(replyTweetFormInputElement, replyTweetFormSubmitElement)
        replyTweetElement.appendChild(replyTweetFormElement)

        tweetDetailsActionsElement.appendChild(replyTweetElement)

        containerElement.append(headerElement, postElement, tweetsElement)
        this.setBackButtonOnClick()
        document.getElementById('tweets-count').remove()
        headerElement.getElementsByClassName('profile-name')[0].innerHTML = 'Tweet'

        await this.renderPostsOrComments({tweetsElement, content: comments, type: 'comment'})
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

myApp.renderApp({userId:7}) // Set userId between 1-10, the available users ids in the JSON Placeholder DB
