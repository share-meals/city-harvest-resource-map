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
		    {t('privacy.summary')} <a id='open-privacy-policy' style={{cursor: 'pointer'}}>{t('privacy.readMore')}</a>
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
	   >
	<IonHeader className='ion-no-border ion-padding'>
	    <IonToolbar>
		<IonTitle>
		    {t('privacy.modalTitle')}
		</IonTitle>
		<IonButtons slot='secondary'>
		    <IonButton onClick={() => modal.current?.dismiss()}>
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
