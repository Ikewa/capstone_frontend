function Form() {
    return (
        <div>
            <h1>Want to improve your farming?</h1>
            <h2>Join us Now</h2>
            <form>
                <input type="text" name="firstName" placeholder="First name" /> <br />
                <input type="text" name="lastName" placeholder="Last name" /> <br />
                <input type="text" name="username" placeholder="Username" /> <br />
                <input type="text" name="location" placeholder="Location" /> <br />
                <input type="password" name="password" placeholder="Password" /> <br />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" /> <br />
                <button type="submit">Submit</button>
            </form>
            <a href="/Landing">Go Back</a>
        </div>
    );
}

export default Form;