<template>
  <main class="EmailVerificationSuccess static-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-xl-6 py-5">
          <h1 class="border-dark mb-3 pb-3 sans">{{ $t('emailVerificationSuccessTitle') }}</h1>
          <p v-html="$t('emailVerificationSuccessMessage')" />
        </div>
      </div>
    </div>
  </main>
</template>

<i18n lang="json">
{
  "en": {
    "emailVerificationSuccessTitle": "Email address verified!",
    "emailVerificationSuccessMessage": "Your account is currently pending manual approval. <br/> We'll email you once it's active."
  }
}
</i18n>
