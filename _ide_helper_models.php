<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * Class Answer
 *
 * @property int $id
 * @property string $answer
 * @property float $score
 * @property int $question_id
 * @property int $csr_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Question $question
 * @property CenterSurveyResponse $response
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereAnswer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereCsrId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereQuestionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Answer whereUpdatedAt($value)
 */
	class Answer extends \Eloquent {}
}

namespace App\Models{
/**
 * Class Center
 *
 * @property int $id
 * @property string $phc_moh_code
 * @property string $name
 * @property int $status
 * @property int $zone_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Zone $zone
 * @property \Illuminate\Database\Eloquent\Collection|Tbc[] $tbcs
 * @property \Illuminate\Database\Eloquent\Collection|CenterDomain[] $centerDomains
 * @property \Illuminate\Database\Eloquent\Collection|CenterSurvey[] $centerSurveys
 * @property \Illuminate\Database\Eloquent\Collection|CenterSurveyResponse[] $surveyResponses
 * @property \Illuminate\Database\Eloquent\Collection|User[] $users
 * @property string $label
 * @property-read int|null $center_domains_count
 * @property-read int|null $center_surveys_count
 * @property-read int|null $survey_responses_count
 * @property-read int|null $tbcs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center wherePhcMohCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Center whereZoneId($value)
 */
	class Center extends \Eloquent {}
}

namespace App\Models{
/**
 * Class CenterDomain
 *
 * @property int $id
 * @property int $center_id
 * @property int $domain_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Center $center
 * @property Domain $domain
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain whereCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain whereDomainId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterDomain whereUpdatedAt($value)
 */
	class CenterDomain extends \Eloquent {}
}

namespace App\Models{
/**
 * Class CenterSurvey
 *
 * @property int $id
 * @property int $center_id
 * @property int $survey_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Center $center
 * @property Survey $survey
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey whereCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey whereSurveyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurvey whereUpdatedAt($value)
 */
	class CenterSurvey extends \Eloquent {}
}

namespace App\Models{
/**
 * Class CenterSurveyResponse
 *
 * @property int $id
 * @property int $center_id
 * @property int $survey_id
 * @property int|null $submitted_by
 * @property \Illuminate\Support\Carbon|null $submitted_at
 * @property float|null $overall_score
 * @property int $year
 * @property int $month
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Center $center
 * @property Survey $survey
 * @property User|null $submittedBy
 * @property \Illuminate\Database\Eloquent\Collection|Answer[] $answers
 * @property-read int|null $answers_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereOverallScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereSubmittedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereSubmittedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereSurveyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CenterSurveyResponse whereYear($value)
 */
	class CenterSurveyResponse extends \Eloquent {}
}

namespace App\Models{
/**
 * Class Domain
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Database\Eloquent\Collection|Question[] $questions
 * @property \Illuminate\Database\Eloquent\Collection|TbcDomain[] $tbcDomains
 * @property \Illuminate\Database\Eloquent\Collection|CenterDomain[] $centerDomains
 * @property \Illuminate\Database\Eloquent\Collection|SurveyDomain[] $surveyDomains
 * @property-read int|null $center_domains_count
 * @property-read int|null $questions_count
 * @property-read int|null $survey_domains_count
 * @property-read int|null $tbc_domains_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Domain whereUpdatedAt($value)
 */
	class Domain extends \Eloquent {}
}

namespace App\Models{
/**
 * Class ELT
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Database\Eloquent\Collection|Zone[] $zones
 * @property string $label
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read int|null $zones_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ELT whereUpdatedAt($value)
 */
	class ELT extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $module
 * @property string|null $label
 * @property string|null $description
 * @property int $is_active
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereModule($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permission withoutRole($roles, $guard = null)
 */
	class Permission extends \Eloquent {}
}

namespace App\Models{
/**
 * Class Question
 *
 * @property int $id
 * @property string $question
 * @property string $type
 * @property bool $required
 * @property int|null $order
 * @property int $domain_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Domain $domain
 * @property \Illuminate\Database\Eloquent\Collection|QuestionOption[] $options
 * @property \Illuminate\Database\Eloquent\Collection|Answer[] $answers
 * @property-read int|null $answers_count
 * @property-read int|null $options_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereDomainId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereQuestion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Question whereUpdatedAt($value)
 */
	class Question extends \Eloquent {}
}

namespace App\Models{
/**
 * Class QuestionOption
 *
 * @property int $id
 * @property string $label
 * @property string $value
 * @property float $score
 * @property string|null $order
 * @property int $status
 * @property int $question_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Question $question
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereQuestionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|QuestionOption whereValue($value)
 */
	class QuestionOption extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $label
 * @property string|null $description
 * @property int $is_active
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role withoutPermission($permissions)
 */
	class Role extends \Eloquent {}
}

namespace App\Models{
/**
 * Class Survey
 *
 * @property int $id
 * @property string $title
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Database\Eloquent\Collection|SurveyQuestion[] $questions
 * @property \Illuminate\Database\Eloquent\Collection|SurveyDomain[] $domains
 * @property \Illuminate\Database\Eloquent\Collection|CenterSurvey[] $centerSurveys
 * @property int|null $created_by
 * @property-read int|null $center_surveys_count
 * @property-read int|null $domains_count
 * @property-read int|null $questions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Survey whereUpdatedAt($value)
 */
	class Survey extends \Eloquent {}
}

namespace App\Models{
/**
 * Class SurveyDomain
 * 
 * Represents the pivot between surveys and domains with ordering.
 *
 * @property int $id
 * @property int $survey_id
 * @property int $domain_id
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Survey $survey
 * @property Domain $domain
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain whereDomainId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain whereSurveyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyDomain whereUpdatedAt($value)
 */
	class SurveyDomain extends \Eloquent {}
}

namespace App\Models{
/**
 * Class SurveyQuestion
 * 
 * Represents the pivot between surveys and questions with potential ordering or grouping.
 *
 * @property int $id
 * @property int $survey_id
 * @property int $question_id
 * @property int|null $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Survey $survey
 * @property Question $question
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion whereQuestionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion whereSurveyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SurveyQuestion whereUpdatedAt($value)
 */
	class SurveyQuestion extends \Eloquent {}
}

namespace App\Models{
/**
 * Class Tbc
 * 
 * Represents a team-based code (TBC) associated with a center and domains.
 *
 * @property int $id
 * @property string $code
 * @property int $center_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Center $center
 * @property \Illuminate\Database\Eloquent\Collection|TbcDomain[] $domains
 * @property-read int|null $domains_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc whereCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tbc whereUpdatedAt($value)
 */
	class Tbc extends \Eloquent {}
}

namespace App\Models{
/**
 * Class TbcDomain
 * 
 * Represents the relationship between a team-based code (TBC) and a domain.
 *
 * @property int $id
 * @property int $tbc_id
 * @property int $domain_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Tbc $team
 * @property Domain $domain
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain whereDomainId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain whereTbcId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TbcDomain whereUpdatedAt($value)
 */
	class TbcDomain extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $center_id
 * @property string|null $mobile
 * @property string $status
 * @property-read \App\Models\Center|null $center
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMobile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * Class Zone
 *
 * @property int $id
 * @property string $name
 * @property string $elt_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property ELT $elt
 * @property string $label
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone whereEltId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Zone whereUpdatedAt($value)
 */
	class Zone extends \Eloquent {}
}

