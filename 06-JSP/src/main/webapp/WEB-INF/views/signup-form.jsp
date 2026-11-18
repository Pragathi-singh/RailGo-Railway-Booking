<%@ taglib prefix="c" uri="jakarta.tags.core"%><form method="post" action="/signup" class="auth-form" novalidate><input type="hidden" name="csrf" value="">
    <c:forEach var="field" items="">
        <c:choose>
            <c:when test=""><label class="field">Full name<input name="fullName" value="" required>
                    <c:if test=""><span class="error"></span></c:if>
                </label></c:when>
            <c:when test=""><label class="field">Email address<input type="email" name="email" value="" required>
                    <c:if test=""><span class="error"></span></c:if>
                </label></c:when>
            <c:when test=""><label class="field">Mobile number<input type="tel" name="mobile" value="" placeholder="10-digit Indian mobile number" required>
                    <c:if test=""><span class="error"></span></c:if>
                </label></c:when>
            <c:otherwise><label class="field"><input type="password" name="" required>
                    <c:if test=""><span class="error"></span></c:if>
                </label></c:otherwise>
        </c:choose>
    </c:forEach><button class="button full" type="submit">Create account →</button>
</form>
<p class="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
