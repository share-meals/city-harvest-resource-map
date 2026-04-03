import {
    closeSharp
} from 'ionicons/icons';
import {
    FC,
    RefObject,
    useRef
} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonText,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import ReactMarkdown from 'react-markdown';

export const PrivacyPolicy = () => {
    const modal = useRef<HTMLIonModalElement>(null);
    const {t} = useTranslation();
    return (
	<>
	    <IonText>
		<p>
		    {t('privacy.title')}
		</p>
	    </IonText>
	    <IonText>
		<p>
		    {t('privacy.summary')} <button id='open-privacy-policy' style={{cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', font: 'inherit'}}>{t('privacy.readMore')}</button>
		</p>
	    </IonText>
	    <Modal {...{modal}} />
	</>
    );
};

const Modal: FC<{modal: RefObject<HTMLIonModalElement>}> = ({modal}) => {
    const {t} = useTranslation();
    return <IonModal
	       ref={modal}
	       trigger='open-privacy-policy'
	       aria-labelledby='privacy-modal-title'
	   >
	<IonHeader className='ion-no-border ion-padding'>
	    <IonToolbar>
		<IonTitle id='privacy-modal-title'>
		    {t('privacy.modalTitle')}
		</IonTitle>
		<IonButtons slot='secondary'>
		    <IonButton aria-label={t('aria.close')} onClick={() => modal.current?.dismiss()}>
			<IonIcon
			    icon={closeSharp}
			    slot='icon-only' />
		    </IonButton>
		</IonButtons>
	    </IonToolbar>
	</IonHeader>
	<IonContent className='ion-padding'>
	    <ReactMarkdown children={t('privacy.body')} />
	</IonContent>
    </IonModal>;
}
